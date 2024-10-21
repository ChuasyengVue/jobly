"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobId,
} = require("./_testCommon");
const { update } = require("./company.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************************ create */

describe("create", function () {
    let newJob = {
        title: 'Job1',
        salary: 100,
        equity: '0.1',
        companyHandle: 'c1'
    };

    test("works", async function () {
        let job = await Job.create(newJob);
        expect(job).toEqual({
            ...newJob, 
            id:expect.any(Number),
        });
    });
});

/************************************************ findAll  */

describe("findAll", function () {
    test("works: no filter", async function () {
        let job = await Job.findAll();
        expect(job).toEqual([
            {
                id:jobId[0],
                title:'Job1',
                salary: 100,
                equity: '0.1',
                companyHandle: 'c1',
                companyName: 'C1'
            },
            {
                id:jobId[1],
                title:'Job2',
                salary: 200,
                equity: '0.2',
                companyHandle: 'c1',
                companyName: 'C1'
            },
            {
                id:jobId[2],
                title:'Job3',
                salary: 300,
                equity: '0',
                companyHandle: 'c1',
                companyName: 'C1'
            },
            {
                id:jobId[3],
                title:'Job4',
                salary: null,
                equity: null,
                companyHandle: 'c1',
                companyName: 'C1'
            }
        ]);
    });
});

/************************************************** get */

describe("get", function () {
    test("works", async function () {
        let job = await Job.get(jobId[0]);
        expect(job).toEqual({
            id:jobId[0],
            title:'Job1',
            salary: 100,
            equity: '0.1',
            company: {
                handle: 'c1',
                name: 'C1',
                description: 'Desc1',
                numEmployees: 1,
                logoUrl: 'http://c1.img'
            }
        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.get(0);
            fail();
        } catch (error) {
            expect(error instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************************** update */

describe("update", function () {
    let updateData = {
        title:'New',
        salary:1000,
        equity:'0.101'
    };

    test("works", async function (){
        let job = await Job.update(jobId[0], updateData);
        expect(job).toEqual({
            id:jobId[0],
            companyHandle:'c1',
            ...updateData,
        });
    });
});

/************************************************ remove */

describe("remove", function () {
    test("works", async function () {
        await Job.remove(jobId[0]);
        const res = await db.query(`
            SELECT id 
            FROM jobs
            WHERE id = $1`,[jobId[0]]);
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such job", async function(){
        try {
            await Job.remove(0)
            fail();
        } catch (error) {
            expect(error instanceof NotFoundError).toBeTruthy();
        }
    });
});

