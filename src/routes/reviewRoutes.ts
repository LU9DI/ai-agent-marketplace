import { Router } from "express";
import { initDb } from "../core/db.js";
import { requireAuth } from "../middleware/auth.js";
const router=Router();
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const parseLimit=(v:unknown)=>{const n=Number(v??20);return Number.isInteger(n)&&n>=1&&n<=100?n:20;};
const parseOffset=(v:unknown)=>{const n=Number(v??0);return Number.isInteger(n)&&n>=0&&n<=100000?n:0;};

router.post("/:listingId",requireAuth,async(req,res)=>{try{const rating=Number(req.body?.rating);if(!Number.isInteger(rating)||rating<1||rating>5)return res.status(400).json({error:"rating must be 1..5"});if(!UUID.test(String(req.params.listingId)))return res.status(400).json({error:"invalid listing id"});const comment=req.body?.comment;if(comment!==undefined&&comment!==null&&(typeof comment!=="string"||comment.length>5000))return res.status(400).json({error:"invalid comment"});const db=initDb();
const listing=await db.query("SELECT id,owner_id FROM agent_listings WHERE id=$1 AND status='published'",[req.params.listingId]);
if(!listing.rowCount)return res.status(404).json({error:"published listing not found"});
if(String(listing.rows[0].owner_id)===String((req as any).userId))return res.status(403).json({error:"listing owner cannot review own agent"});
const install=await db.query("SELECT id FROM agent_installs WHERE listing_id=$1 AND user_id=$2 AND status='active' LIMIT 1",[req.params.listingId,(req as any).userId]);
if(!install.rowCount)return res.status(403).json({error:"an active installation is required to review this agent"});
await db.query("INSERT INTO agent_reviews (id,listing_id,reviewer_id,rating,comment) VALUES (gen_random_uuid(),$1,$2,$3,$4) ON CONFLICT(listing_id,reviewer_id) DO UPDATE SET rating=EXCLUDED.rating,comment=EXCLUDED.comment,created_at=now()",[req.params.listingId,(req as any).userId,rating,comment??null]);res.status(201).json({ok:true});}catch{res.status(400).json({error:"failed to save review"});}});

router.get("/:listingId",async(req,res)=>{try{
  if(!UUID.test(String(req.params.listingId)))return res.status(400).json({error:"invalid listing id"});
  const limit=parseLimit(req.query.limit),offset=parseOffset(req.query.offset);
  const listing=await initDb().query("SELECT id FROM agent_listings WHERE id=$1 AND status='published'",[req.params.listingId]);
  if(!listing.rowCount)return res.status(404).json({error:"published listing not found"});
  const r=await initDb().query("SELECT rating,comment,created_at FROM agent_reviews WHERE listing_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",[req.params.listingId,limit,offset]);
  const count=await initDb().query("SELECT COUNT(*)::int AS count,COALESCE(AVG(rating),0)::float AS average FROM agent_reviews WHERE listing_id=$1",[req.params.listingId]);
  res.json({averageRating:Math.round(Number(count.rows[0].average)*100)/100,count:Number(count.rows[0].count),reviews:r.rows,pagination:{limit,offset,hasMore:offset+r.rows.length<Number(count.rows[0].count)}});
}catch{res.status(500).json({error:"failed to load reviews"});}});
export default router;