/**********************import**********************/
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');


/**********************app**********************/
const app = express();

/*app use cors to communicat the server*/
app.use(cors());


/**********************DB**********************/
/*Connect to the DB*/
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'MBGuest',
    password: 'MBGuest1!',
    database: 'tobprecise_britt'
});

/*Start the connection*/
connection.connect(err => {
    if(err) {
        return err;
    }
});


/**********************Requests**********************/

app.get('/', (req, res) => {
    res.send("go to /employees - to see Employee List <br>"+
            "go to /employee/:emp_no - to see Employee Private Details <br>" +
            "go to /employee/:emp_no/tasks - to see Employee's All Tasks <br>" +
            "go to /employee/:emp_no/subordinates - to see Employee's direct subordinates <br>" +
            "go to /employee/:emp_no/add_report - to add a new report from the employee <br>" +
            "go to /employee/:emp_no/add_task - to add a new task to the employee")
});


/*GET request - returns a list of names and position of all employees in org-stracture*/
const empListQuery = "SELECT * FROM `employee`"
app.get('/employees', (req, res) => {
    connection.query(empListQuery, (err, results) => {
        if(err) {
            return res.send(err)
        }
        else {
            return res.json ({
                data: results
            })
        }
    })
});
     

/*GET request - returns name and position of selected employee and his direct manager name*/
app.get('/employee/:emp_no', (req, res) => {
    const empPrivateDetailesQuery = `SELECT emp.emp_no, emp.first_name, emp.last_name, emp.position, ` +
                                `mng.emp_no as mng_emp_no, mng.first_name AS mng_first_name, mng.last_name AS mng_last_name ` +
                            `FROM \`employee\` AS emp JOIN ` +
                                `\`manager\` AS conn JOIN ` +
                                `\`employee\` AS mng ` + 
                            `WHERE emp.emp_no = conn.emp_no AND ` +
                               `mng.emp_no = conn.mng_no AND ` +
                               `emp.emp_no = ${req.params.emp_no}`
    connection.query(empPrivateDetailesQuery, (err, results) => {
        if(err) {
            return res.send(err)
        }
        else {
            return res.json ({
                data: results
            })
        }
    })
});


/*GET request - returns all the tasks and the due date of them for a selected employee*/ 
app.get('/employee/:emp_no/tasks', (req, res) => {
    const empTasks = `SELECT task_text, task_due_date ` +
                    `FROM \`employee\` as emp NATURAL JOIN \`task\` ` +
                    `WHERE emp_no = ${req.params.emp_no}`   
    connection.query(empTasks, (err, results) => {
        if(err) {
            return res.send(err)
        }
        else {
            return res.json ({
                data: results
            })
        }
    })
});


/*GET request - returns all the direct subordinates of a selected employee, who is actually their manager*/
app.get('/employee/:emp_no/subordinates', (req, res) => {
    const empSubordinates = `SELECT emp.first_name, emp.last_name, emp.position ` +
                `FROM \`manager\` AS mng JOIN \`employee\` AS emp ` +
                `WHERE mng.emp_no = emp.emp_no AND ` +
                `mng.mng_no = ${req.params.emp_no}`
    connection.query(empSubordinates, (err, results) => {
        if(err) {
            return res.send(err)
        }
        else {
            return res.json ({
                data: results
            })
        }
    })
});

/*
*GET request - insert a new report from a selected employee to his manager
*Usage - http://localhost:4000/employee/:emp_no/add_report?report_text=write here the report text
*/
app.get('/employee/:emp_no/add_report', (req, res) => {
    const {report_text} = req.query;

    const insertReport = `INSERT INTO report (report_text, report_date, emp_no) ` +
                        `VALUES (\"${report_text}\", current_date(), \"${req.params.emp_no}\")`
    connection.query(insertReport, (err, results) => {
        if(err) {
            return res.send(err)
        }
        else {
            return res.send(`successfuly add new report: ${report_text}, ${req.params.emp_no}`)
        }
    })
});


/*
*GET request - insert a new task to a selected employee from his manager
*Usage - http://localhost:4000/employee/:emp_no/add_task?task_text=insert here the task text&task_due_date=YYYY-MM-DD
*/
app.get('/employee/:emp_no/add_task', (req, res) => {
    const {task_text, task_due_date} = req.query;

    const insertReport = `INSERT INTO task (task_text, task_assign_date, task_due_date, emp_no) ` +
                        `VALUES (\"${task_text}\", current_date(),\"${task_due_date}\", \"${req.params.emp_no}\")`
    connection.query(insertReport, (err, results) => {
        if(err) {
            return res.send(err)
        }
        else {
            return res.send(`successfuly add new task: ${task_text}, ${task_due_date}, ${req.params.emp_no}`)
        }
    })
});


/**********************Port**********************/
/*The port listening for this server*/
app.listen(4000, () => {
    console.log('Organisation-Structure Server listening on port 4000')
});
    