import { Router } from "express";
import { randomUUID } from "node:crypto";
import { initDb } from "../core/db.js";
import { requireAuth } from "../middleware/auth.js";
import { prepareListing } from "../services/agentService.js";
const router=Router();
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.post("/",requireAuth,async(req,res)=>{try{const a=prepareListing({...req.body,ownerId:(req as any).userId});const id=randomUUID();await initDb().query("INSERT INTO agent_listings (id,owner_id,name,description,version,price_cents,capabilities,status) VALUES ($1,$2,$3,$4,$5,$6,$7,'draft')",[id,(req as any).userId,a.name,a.description,a.version,a.priceCents??null,JSON.stringify(a.capabilities)]);res.status(201).json({id,...a,status:"draft"});}catch{res.status(400).json({error:"invalid agent listing"});}});

router.get("/",async(req,res)=>{try{const q=String(req.query.q||"").trim();const capability=String(req.query.capability||"").trim();const params:any[]=["published"];let sql="SELECT id,owner_id,name,description,version,price_cents,capabilities,status,created_at FROM agent_listings WHERE status=$1";if(q){params.push("%"+q+"%");sql+=" AND (name ILIKE $"+params.length+" OR description ILIKE $"+params.length+")";}if(capability){params.push(capability);sql+=" AND capabilities @> $"+params.length+"::jsonb";}sql+=" ORDER BY updated_at DESC LIMIT 100";const r=await initDb().query(sql,params);res.json({agents:r.rows});}catch{res.status(500).json({error:"failed to load agents"});}});

router.get("/mine",requireAuth,async(req,res)=>{try{const r=await initDb().query("SELECT id,name,description,version,price_cents,capabilities,status,created_at,updated_at FROM agent_listings WHERE owner_id=$1 ORDER BY updated_at DESC LIMIT 100",[(req as any).userId]);res.json({agents:r.rows});}catch{res.status(500).json({error:"failed to load owned agents"});}});

router.get("/:id",async(req,res)=>{try{if(!UUID.test(String(req.params.id)))return res.status(400).json({error:"invalid agent id"});const r=await initDb().query("SELECT id,owner_id,name,description,version,price_cents,capabilities,status,created_at FROM agent_listings WHERE id=$1 AND status='published'",[req.params.id]);if(!r.rowCount)return res.status(404).json({error:"agent not found"});const review=await initDb().query("SELECT COALESCE(AVG(rating),0) average,COUNT(*) count FROM agent_reviews WHERE listing_id=$1",[req.params.id]);res.json({agent:r.rows[0],rating:{average:Number(review.rows[0].average),count:Number(review.rows[0].count)}});}catch{res.status(500).json({error:"failed to load agent"});}});

router.post("/:id/publish",requireAuth,async(req,res)=>{try{if(!UUID.test(String(req.params.id)))return res.status(400).json({error:"invalid agent id"});const r=await initDb().query("UPDATE agent_listings SET status='published',updated_at=now() WHERE id=$1 AND owner_id=$2 AND status='draft' RETURNING id,status,updated_at",[req.params.id,(req as any).userId]);if(!r.rowCount)return res.status(404).json({error:"draft listing not found"});res.json({agent:r.rows[0]});}catch{res.status(500).json({error:"failed to publish agent"});}});

router.post("/:id/suspend",requireAuth,async(req,res)=>{try{if(!UUID.test(String(req.params.id)))return res.status(400).json({error:"invalid agent id"});const r=await initDb().query("UPDATE agent_listings SET status='suspended',updated_at=now() WHERE id=$1 AND owner_id=$2 AND status='published' RETURNING id,status,updated_at",[req.params.id,(req as any).userId]);if(!r.rowCount)return res.status(404).json({error:"published listing not found"});res.json({agent:r.rows[0]});}catch{res.status(500).json({error:"failed to suspend agent"});}});

export default router;