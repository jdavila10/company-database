const inquirer = require("inquirer");
const mysql = require("mysql");
const table = require("console.table");

let employees = [];
let managers = [];
let roles = [];
let departments = [];

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "employee_db"
});

connection.connect((err) => {
    if (err) throw err;
    mainMenu();
});
//Main menu Inquirer
function mainMenu() {
    inquirer.prompt([
        {
            name: "main",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View All Employees",
                "View Employees By Department",
                "View Employees By Manager",
                "Add Employee",
                "Add Department",
                "Remove Employee",
                "Update Employee Role",
                "Update Employee Manager",
                "Exit"
            ]
        }
    ]).then((response) => {
        let answer = response.main;
        switch (answer) {
            case "View All Employees":
                viewAllEmployees();
                break;

            case "View Employees By Department":
                viewByDepartment();
                break;

            case "View Employees By Manager":
                vieByManager();
                break;

            case "Add Employee":
                addEmployee();
                break;

            case "Add Department":
                addDepartment();
                break;

            case "Remove Employee":
                removeEmployee();
                break;

            case "Update Employee Role":
                updateEmployeeRole();
                break;

            case "Update Employee Manager":
                updateEmployeeManager();
                break;

            case "Exit":
                //Exit out of the app
                console.log("Goodbye");                
                connection.end();
        };
    });
};

//View All Employees Function
function viewAllEmployees() {
    connection.query("SELECT * FROM employee", (err, result) => {
        if (err) throw err;
        console.table(result);
        mainMenu();
    });
};

//View Employees by Department
function viewByDepartment() {
    connection.query("SELECT * FROM department", (err, result) => {
        if (err) throw err;
        departments = [];
        let departmentArray = result;
        for (let i = 0; i < departmentArray.length; i++) {
            departments.push(departmentArray[i].name);
        };
        inquirer.prompt([
            {
                name: "department",
                type: "list",
                message: "Select a department to see all of its employees",
                choices: departments
            }
        ]).then((response) => {
            let departmentID;
            for (let i = 0; i < departmentArray.length; i++) {
                if (response.department === departmentArray[i].name)
                    departmentID = departmentArray[i].id;
            };
            connection.query("SELECT * FROM employee, role WHERE role.department_id = ? AND employee.role_id = role.id", departmentID, (err, result) => {
                if (err) throw err;
                for (let i = 0; i < result.length; i++)
                    console.log(`${result[i].first_name} ${result[i].last_name}`);
                console.log("\n");
                mainMenu();
            });
        });
    });
};

//View Employees by Manager
function vieByManager() {

    connection.query("SELECT * FROM employee WHERE manager_id IS NULL", (err, result) => {
        if (err) throw err;
        managers = [];
        let managersArray = result;
        for (let i = 0; i < result.length; i++)
            managers.push(result[i].first_name + " " + result[i].last_name);
        inquirer.prompt([
            {
                name: "manager",
                type: "list",
                message: "Of which manager would you like to see all employees?",
                choices: managers
            }
        ]).then((response) => {
            let managerID;
            for (let i = 0; i < managersArray.length; i++) {
                if (response.manager === managersArray[i].first_name + " " + managersArray[i].last_name)
                    managerID = managersArray[i].id;
            };
            connection.query("SELECT * FROM employee WHERE manager_id = ?", managerID, (err, result) => {
                if (err) throw err;
                for (let i = 0; i < result.length; i++)
                    console.log(`${result[i].first_name} ${result[i].last_name}`);
                console.log("\n");
                mainMenu();
            });
        });
    });
};

//Add Employee
function addEmployee() {
    connection.query("SELECT * FROM employee WHERE manager_id IS NULL", (err, result) => {
        if (err) throw err;
        managers = [];
        roles = [];
        let managersArray = result;
        for (let i = 0; i < result.length; i++)
            managers.push(result[i].first_name + " " + result[i].last_name);
        connection.query("SELECT * FROM role", (err, response) => {
            if (err) throw err;
            let rolesArray = response;
            for (let i = 0; i < response.length; i++)
                roles.push(response[i].title);
            inquirer.prompt([
                {
                    name: "firstName",
                    type: "input",
                    message: "What is the new employee's first name?",
                    validate: (input) => {
                        if (input === "") return false;
                        return true;
                    }
                },
                {
                    name: "lastName",
                    type: "input",
                    message: "What is the new employee's last name?",
                    validate: (input) => {
                        if (input === "") return false;
                        return true;
                    }
                },
                {
                    name: "role",
                    type: "list",
                    message: "What is the new employee's role?",
                    choices: roles
                },
                {
                    name: "manager",
                    type: "list",
                    message: "Who is the new employee's manager?",
                    choices: managers
                }
            ]).then((response) => {
                let firstName = response.firstName;
                let lastName = response.lastName;
                let roleID;
                for (let i = 0; i < rolesArray.length; i++) {
                    if (response.role === rolesArray[i].title) {
                        roleID = rolesArray[i].id;
                    };
                };
                let managerID;
                for (let i = 0; i < managersArray.length; i++) {
                    if (response.manager === managersArray[i].first_name + " " + managersArray[i].last_name)
                        managerID = managersArray[i].id;
                };
                connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${firstName}", "${lastName}", ${roleID}, ${managerID})`, (err, res) => {
                    if (err) throw err;
                    console.log(`\n Employee ${firstName} ${lastName} added to the employee table \n`);
                    mainMenu();
                });
            });
        });
    });
};

// Add a Department
function addDepartment() {
    inquirer.prompt([
        {
            name: "department_name",
            type: "input",
            message: "What department would you like to add?",
            validate: (input) => {
                if (input === "") return false;
                return true;
            }
        }

    ]).then((response) => {
        let department = response.department_name;
        connection.query(
            "INSERT INTO department SET ?",
            { name: department },
            function (err, answer) {
                if (err) {
                    throw err;
                }
                console.log(`\n ${department} Department has been added to the table \n`);
            }
        );
        mainMenu();
    });
};


//Remove Employee
function removeEmployee() {
    let employees = [];
    let employeeListArray;
    connection.query("SELECT * FROM employee ORDER BY id ASC", (err, res) => {
        if (err) throw err;
        employeeListArray = res;
        for (let i = 0; i < res.length; i++)
            employees.push(res[i].first_name + " " + res[i].last_name);
        inquirer.prompt([
            {
                name: "employeeToRemove",
                type: "list",
                message: "Which employee would you like to remove?",
                choices: employees
            },
            {
                name: "yes_no",
                type: "list",
                message: "Are you sure you'd like to remove this employee?",
                choices: ["Yes", "No"]
            }
        ]).then((response) => {
            let employeeToRemove;
            for (let i = 0; i < employees.length; i++) {
                if (response.employeeToRemove === employeeListArray[i].first_name + " " + employeeListArray[i].last_name)
                    employeeToRemove = employeeListArray[i].id;
            };
            if (response.yes_no === "Yes") {
                connection.query("DELETE FROM employee WHERE id=?", employeeToRemove, (err, res) => {
                    if (err) throw err;
                    console.log(`\n Employee ${response.employeeToRemove} was removed \n`);
                    mainMenu();
                });
            } else
                mainMenu();
        });
    });
};

//Update Employee's role
function updateEmployeeRole() {
    employees = [];
    roles = [];
    connection.query("SELECT * FROM employee", (err, result) => {
        let employeesArray = result;
        if (err) throw err;
        for (let i = 0; i < result.length; i++)
            employees.push(result[i].first_name + " " + result[i].last_name);
        inquirer.prompt([
            {
                type: "list",
                name: "employee",
                message: "Which employee's role would you like to update?",
                choices: employees
            }
        ]).then((answer) => {
            let employeeID;
            let employee = answer.employee;
            for (let i = 0; i < employeesArray.length; i++) {
                if (answer.employee === employeesArray[i].first_name + " " + employeesArray[i].last_name)
                    employeeID = employeesArray[i].id;
            }
            connection.query("SELECT * FROM role", (err, response) => {
                let rolesArray = response;
                if (err) throw err;
                for (let i = 0; i < rolesArray.length; i++)
                    roles.push(rolesArray[i].title);
                inquirer.prompt([
                    {
                        type: "list",
                        name: "newRole",
                        message: `What would you like ${employee}'s new role to be?`,
                        choices: roles
                    }
                ]).then((response) => {
                    let roleID;
                    let role = response.newRole;
                    for (let i = 0; i < rolesArray.length; i++) {
                        if (response.newRole === rolesArray[i].title)
                            roleID = rolesArray[i].id;
                    };
                    connection.query("UPDATE employee SET role_id = ? WHERE ID = ?", [roleID, employeeID], (err, answer) => {
                        if (err) throw err;
                        console.log(`${employee}'s role has been updated to ${role}`);
                        console.log("\n");
                        mainMenu();
                    });
                });
            });
        });
    });
};

//Update Employee's manager
function updateEmployeeManager() {
    employees = [];
    roles = [];
    connection.query("SELECT * FROM employee", (err, result) => {
        let employeesArray = result;
        if (err) throw err;
        for (let i = 0; i < result.length; i++)
            employees.push(result[i].first_name + " " + result[i].last_name);
        inquirer.prompt([
            {
                type: "list",
                name: "employee",
                message: "Which employee's manager would you like to update?",
                choices: employees
            }
        ]).then((answer) => {
            let employeeID;
            let employee = answer.employee;
            let index = employees.indexOf(employee);
            if (index > -1) {
                employees.splice(index, 1);
            }
            for (let i = 0; i < employeesArray.length; i++) {
                if (answer.employee === employeesArray[i].first_name + " " + employeesArray[i].last_name)
                    employeeID = employeesArray[i].id;
            }
            inquirer.prompt([
                {
                    type: "list",
                    name: "newManager",
                    message: `Who would you like to be ${employee}'s new manager to be?`,
                    choices: employees
                }
            ]).then((response) => {
                let newManagerID;
                let newManager = response.newManager;
                for (let i = 0; i < employeesArray.length; i++) {
                    if (response.newManager === employeesArray[i].first_name + " " + employeesArray[i].last_name)
                        newManagerID = employeesArray[i].id;
                };
                connection.query("UPDATE employee SET manager_id = ? WHERE ID = ?", [newManagerID, employeeID], (err, answer) => {
                    if (err) throw err;
                    console.log(`${employee}'s manager has been updated to ${newManager}`);
                    console.log("\n");
                    mainMenu();
                });
            });
        });
    });
};
