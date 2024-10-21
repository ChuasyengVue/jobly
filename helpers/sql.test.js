const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("Testing sqlForpartialUpdate", function(){

    test("works for 1 field", async function () {
        let dataToUpdate = {firstName: 'Aliya'}
        let jsToSql = {firstName: "first_name"}

        const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

        expect(result).toEqual({
            setCols: '"first_name"=$1',
            values: ['Aliya']
        });
    });

    test("works for 2 field", async function () {
        let dataToUpdate = {firstName: 'Aliya', age: 32};
        let jsToSql = {firstName: "first_name", age: "age"};

        const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

        expect(result).toEqual({
            setCols: '"first_name"=$1, "age"=$2',
            values: ['Aliya', 32]
        });
    });

    test("bad request if no data", async function () {
        expect(() => {
            sqlForPartialUpdate({}, {})
        }).toThrow(BadRequestError)
    });
});
