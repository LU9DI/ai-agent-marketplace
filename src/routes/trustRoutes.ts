import { Router } from "express";
import { initDb } from "../core/db.js";
const router=Router();

router.get("/", async (_req,res)=>{
  try{
    const db=initDb();
    const r=await db.query(`
      SELECT l.id,l.name,l.version,l.updated_at,
        (SELECT COUNT(*)::int FROM agent_installs i WHERE i.listing_id=l.id AND i.status='active') install_count,
        (SELECT COUNT(*)::int FROM agent_reviews rv WHERE rv.listing_id=l.id) review_count,
        (SELECT COALESCE(AVG(rv.rating),0)::float FROM agent_reviews rv WHERE rv.listing_id=l.id) average_rating,
        GREATEST(0,EXTRACT(EPOCH FROM (now()-l.updated_at))/86400.0) age_days
      FROM agent_listings l
      WHERE l.status='published'
      ORDER BY l.updated_at DESC
      LIMIT 100
    `);
    const agents=r.rows.map((a:any)=>{
      const installs=Number(a.install_count||0), reviews=Number(a.review_count||0), rating=Number(a.average_rating||0);
      const volume=Math.min(40,Math.log1p(installs)*8);
      const ratingSignal=rating>0 ? Math.min(35,(rating/5)*35*(reviews>=5?1:reviews/5)) : 0;
      const reviewDepth=Math.min(15,Math.log1p(reviews)*5);
      const freshness=Math.max(0,10-Math.min(10,Number(a.age_days)/30));
      const trustScore=Math.round(Math.min(100,volume+ratingSignal+reviewDepth+freshness)*100)/100;
      return {...a,trust_score:trustScore,trust_factors:{install_volume:Math.round(volume*100)/100,rating_quality:Math.round(ratingSignal*100)/100,review_depth:Math.round(reviewDepth*100)/100,freshness:Math.round(freshness*100)/100}};
    }).sort((a:any,b:any)=>b.trust_score-a.trust_score);
    res.json({agents,definition:"Trust score combines adoption, rating quality, review depth and listing freshness; it is not a guarantee of agent quality."});
  }catch{res.status(500).json({error:"failed to calculate trust signals"});}
});
export default router;
