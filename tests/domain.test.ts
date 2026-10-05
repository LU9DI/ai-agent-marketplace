import { test } from "node:test";
import assert from "node:assert/strict";
import { validateAgentListing } from "../src/domain/agents.js";
test("validates agent listing",()=>{assert.equal(validateAgentListing({name:"Agent",description:"desc",ownerId:"u",version:"1.0.0",capabilities:["chat"]}),true);assert.throws(()=>validateAgentListing({name:"",description:"desc",ownerId:"u",version:"1",capabilities:[]}));});
