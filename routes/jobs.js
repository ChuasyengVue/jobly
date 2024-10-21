"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureIsAdmin, ensureAdminOrUser } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const { max } = require("pg/lib/defaults");

const router = new express.Router();

/** POST / { job } => { job } 
 * 
 * job should be { id, title, salary, equity, companyHandle }
 * 
 * Returns { id, title, salary, equity, companyHandle 
 * 
 * Authorization required: login
*/

router.post("/", ensureAdminOrUser, async function (req, res, next){
    try{
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if(!validator.valid){
            const errs = validator.errors.map(error => error.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.create(req.body);
        return res.status(201).json({job});
    }
    catch(error){
        return next(error);
    }
});

/** GET / =>
 *  {jobs: [ { id, title, salary, equity, companyHandle }]}
 * 
 * Can filter on provided search filters:
 * -title: (filter by job title)
 * -minSalary: (filter jobs with salary)
 * -hasEquity: (if true)
 * 
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {

    try {
        let {title, minSalary, hasEquity} = req.query;

        if(minSalary !== undefined){ minSalary = +minSalary;}
    
        hasEquity = hasEquity === "true";

        const jobs = await Job.findAll({title, minSalary, hasEquity});
        return res.json({jobs});

    } catch (error) {
        return next(error);
    }
});

/** GET /[id] => { job }
 * 
 * Job is { id, title, salary, equity, companyHandle }
 *  where companies = [ { handle, name, description, numEmployees, logoUrl, jobs }]
 * 
 * Authorization require: none
 */

router.get("/:id", async function (req, res, next) {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job });
    } catch (error) {
        return next(error)
    }
});

/** PATCH /[id] { fld1, fld2, ...} => { job }
 * 
 * Patches job data.
 * 
 * field can be: { title, salary, equity, companyHandle }
 * 
 * Returns { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: login
 */
router.patch("/:id", ensureIsAdmin, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
    
        const job = await Job.update(req.params.id, req.body);
        return res.json ({ job });
    
    } catch (error) {
        return next(error);
    }
})



/** DELETE /[id] => { deleted: id }
 * 
 * Authorization: login
 */

router.delete("/:id", ensureIsAdmin, async function (req, res, next) {
    try {
        await Job.remove(req.params.id);
        return res.json({ deleted: +req.params.id});
    } catch (error) {
        return next(error);
    }
});

module.exports = router;