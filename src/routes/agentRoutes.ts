import { Router } from "express";
import { prepareListing } from "../services/agentService.js";
import { requireAuth } from "../middleware/auth.js";
const router=Router();
router.post("/validate",requireAuth,(req,res)=>{try{res.json({valid:true,listing:prepareListing(req.body)});}catch(e){res.status(400).json({valid:false,error:e instanceof Error?e.message:"invalid agent listing"});}});
export default router;
