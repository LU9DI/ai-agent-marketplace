import { Router } from "express";
import { randomUUID } from "node:crypto";
import { initDb } from "../core/db.js";
import { requireAuth } from "../middleware/auth.js";
const router=Router();
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
router.post("/:listingId",requireAuth,async(req,res)=>{try{
  if(!UUID.test(String(req.params.listingId)))return res.status(400).json({error:"invalid listing id"});
  const db=await initDb(); const userId=(req as any).userId;
  const listing=await db.query("SELECT id,name,version,status FROM agent_listings WHERE id=$1 AND status='published'",[req.params.listingId]);
  if(!listing.rowCount)return res.status(404).json({error:"published listing not found"});
  const id=randomUUID();
  const r=await db.query("INSERT INTO agent_installs (id,listing_id,user_id) VALUES ($1,$2,$3) ON CONFLICT(listing_id,user_id) DO UPDATE SET status='active' RETURNING id,status,created_at",[id,req.params.listingId,userId]);
  res.status(201).json({id:r.rows[0].id,listing:listing.rows[0],status:r.rows[0].status,createdAt:r.rows[0].created_at});
}catch{res.status(400).json({error:"failed to install agent"});}});
router.delete("/:listingId",requireAuth,async(req,res)=>{try{
  if(!UUID.test(String(req.params.listingId)))return res.status(400).json({error:"invalid listing id"});
  const r=await initDb().query("UPDATE agent_installs SET status='revoked' WHERE listing_id=$1 AND user_id=$2 RETURNING id,status",[req.params.listingId,(req as any).userId]);
  if(!r.rowCount)return res.status(404).json({error:"installation not found"});
  res.json({install:r.rows[0]});
}});
router.get("/mine",requireAuth,async(req,res)=>{try{const r=await initDb().query("SELECT i.id,i.status,i.created_at,a.id AS listing_id,a.name,a.version FROM agent_installs i JOIN agent_listings a ON a.id=i.listing_id WHERE i.user_id=$1 ORDER BY i.created_at DESC",[(req as any).userId]);res.json({installs:r.rows});}catch{res.status(500).json({error:"failed to load installs"});}});
export default router;