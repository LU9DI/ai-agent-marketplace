import { randomUUID } from "node:crypto";
import { initDb } from "../core/db.js";

export async function installAgent(listingId:string,userId:string,client?:any){
 const db=client??initDb();
 const a=await db.query("SELECT id,version,status FROM agent_listings WHERE id=$1 AND status='published'",[listingId]);
 if(!a.rowCount)return null;
 const v=await db.query("SELECT id FROM agent_versions WHERE agent_id=$1 AND version=$2",[listingId,a.rows[0].version]);
 let versionId=v.rows[0]?.id;
 if(!versionId){
  const ins=await db.query("INSERT INTO agent_versions(id,agent_id,version,manifest,status) VALUES($1,$2,$3,$4,'published') RETURNING id",[randomUUID(),listingId,a.rows[0].version,JSON.stringify({})]);
  versionId=ins.rows[0].id;
 }
 const r=await db.query("INSERT INTO agent_installs(id,listing_id,user_id,version_id,status) VALUES($1,$2,$3,$4,'active') ON CONFLICT(listing_id,user_id) DO UPDATE SET version_id=EXCLUDED.version_id,status='active',updated_at=now() RETURNING *",[randomUUID(),listingId,userId,versionId]);
 return r.rows[0];
}