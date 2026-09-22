import { Router } from "express";
import { randomUUID } from "node:crypto";
import { prepareListing } from "../services/agentService.js";
import { initDb } from "../core/db.js";
import { requireAuth } from "../middleware/auth.js";
const router=Router();

router.post("/",requireAuth,async(req,res)=>{try{const a=prepareListing(req.body);const id=randomUUID();await initDb().query("INSERT INTO agent_listings (id,owner_id,name,description,version,price_cents,capabilities) VALUES ($1,$2,$3,$4,$5,$6,$7)",[id,(req as any).userId,a.name,a.description,a.version,a.priceCents??null,JSON.stringify(a.capabilities||[])]);res.status(201).json({id,listing:a,status:"draft"});}catch(e){res.status(400).json({valid:false,error:e instanceof Error?e.message:"invalid agent listing"});}});

router.get("/",async(_req,res)=>{try{const r=await initDb().query("SELECT id,owner_id,name,description,version,price_cents,capabilities,status,created_at,updated_at FROM agent_listings WHERE status='published' ORDER BY updated_at DESC LIMIT 100");res.json({listings:r.rows});}catch{res.status(500).json({error:"failed to load listings"});}});

router.get("/mine",requireAuth,async(req,res)=>{try{const r=await initDb().query("SELECT id,name,description,version,price_cents,capabilities,status,created_at,updated_at FROM agent_listings WHERE owner_id=$1 ORDER BY updated_at DESC LIMIT 100",[(req as any).userId]);res.json({listings:r.rows});}catch{res.status(500).json({error:"failed to load listings"});}});

router.post("/validate",requireAuth,(req,res)=>{try{res.json({valid:true,listing:prepareListing(req.body)});}catch(e){res.status(400).json({valid:false,error:e instanceof Error?e.message:"invalid agent listing"});}});

router.post("/:id/publish",requireAuth,async(req,res)=>{try{const db=await initDb();const r=await db.query("UPDATE agent_listings SET status='published',updated_at=now() WHERE id=$1 AND owner_id=$2 AND status='draft' RETURNING id,status,updated_at",[req.params.id,(req as any).userId]);if(!r.rowCount)return res.status(404).json({error:"draft listing not found"});res.json({listing:r.rows[0]});}catch{res.status(500).json({error:"failed to publish listing"});}});

router.post("/:id/suspend",requireAuth,async(req,res)=>{try{const db=await initDb();const r=await db.query("UPDATE agent_listings SET status='suspended',updated_at=now() WHERE id=$1 AND owner_id=$2 AND status='published' RETURNING id,status,updated_at",[req.params.id,(req as any).userId]);if(!r.rowCount)return res.status(404).json({error:"published listing not found"});res.json({listing:r.rows[0]});}catch{res.status(500).json({error:"failed to suspend listing"});}});

export default router;