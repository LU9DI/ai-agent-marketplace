import { Router } from "express";
import { randomUUID } from "node:crypto";
import { initDb } from "../core/db.js";
import { requireAuth } from "../middleware/auth.js";
const router=Router();
const MAX_INSTALLS_PER_USER=500;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const parseLimit=(v:unknown)=>{const n=Number(v??20);return Number.isInteger(n)&&n>=1&&n<=100?n:20;};
const parseOffset=(v:unknown)=>{const n=Number(v??0);return Number.isInteger(n)&&n>=0&&n<=100000?n:0;};

router.post("/:listingId",requireAuth,async(req,res)=>{try{
  if(!UUID.test(String(req.params.listingId)))return res.status(400).json({error:"invalid listing id"});
  const db=initDb();const userId=(req as any).userId;const client=await db.connect();
  try{await client.query("BEGIN");await client.query("SELECT pg_advisory_xact_lock(hashtext($1))",[String(userId)+":installs"]);
  const count=await client.query("SELECT COUNT(*)::int count FROM agent_installs WHERE user_id=$1 AND status='active'",[userId]);if(Number(count.rows[0].count)>=MAX_INSTALLS_PER_USER){await client.query("ROLLBACK");return res.status(429).json({error:"installation limit reached",limit:MAX_INSTALLS_PER_USER});}
  const listing=await client.query("SELECT id,name,version,status FROM agent_listings WHERE id=$1 AND status='published'",[req.params.listingId]);
  if(!listing.rowCount){await client.query("ROLLBACK");return res.status(404).json({error:"published listing not found"});}
  const id=randomUUID();
  const r=await db.query("INSERT INTO agent_installs (id,listing_id,user_id) VALUES ($1,$2,$3) ON CONFLICT(listing_id,user_id) DO UPDATE SET status='active' RETURNING id,status,created_at",[id,req.params.listingId,userId]);
  res.status(201).json({id:r.rows[0].id,listing:listing.rows[0],status:r.rows[0].status,createdAt:r.rows[0].created_at});
}catch{res.status(400).json({error:"failed to install agent"});}});

router.delete("/:listingId",requireAuth,async(req,res)=>{try{
  if(!UUID.test(String(req.params.listingId)))return res.status(400).json({error:"invalid listing id"});
  const r=await initDb().query("UPDATE agent_installs SET status='revoked' WHERE listing_id=$1 AND user_id=$2 RETURNING id,status",[req.params.listingId,(req as any).userId]);
  if(!r.rowCount)return res.status(404).json({error:"installation not found"});
  res.json({install:r.rows[0]});
}catch{res.status(400).json({error:"failed to revoke installation"});}});

router.get("/mine",requireAuth,async(req,res)=>{try{
  const limit=parseLimit(req.query.limit),offset=parseOffset(req.query.offset),userId=(req as any).userId;
  const db=initDb();
  const r=await db.query("SELECT i.id,i.status,i.created_at,a.id AS listing_id,a.name,a.version FROM agent_installs i JOIN agent_listings a ON a.id=i.listing_id WHERE i.user_id=$1 ORDER BY i.created_at DESC LIMIT $2 OFFSET $3",[userId,limit,offset]);
  const count=await db.query("SELECT COUNT(*)::int AS count FROM agent_installs WHERE user_id=$1",[userId]);
  res.json({installs:r.rows,pagination:{limit,offset,hasMore:offset+r.rows.length<Number(count.rows[0].count)}});
}catch{res.status(500).json({error:"failed to load installs"});}});
export default router;