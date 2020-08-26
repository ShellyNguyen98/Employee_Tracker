const { prompt } = require('inquirer')
const mysql = require('mysql2')
require('console.table')

const db = mysql.createConnection('mysql://root:rootroot@localhost/employee_db')

const mainMenu = () => {
  prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Choose an action:',
      choices: [
        {
          name: 'View Employees',
          value: 'viewEmployees'
        },
        {
          name: 'Add An Employee',
          value: 'addEmployee'
        },
        {
          name: `Update An Employee's Role`,
          value: 'updateEmployeeRole'
        },
        {
          name: 'View Departments',
          value: 'viewDepartments'
        },
        {
          name: 'Add A Department',
          value: 'addDepartment'
        },
        {
          name: 'View Roles',
          value: 'viewRoles'
        },
        {
          name: 'Add A Role',
          value: 'addRole'
        }
      ]
    }
  ])
    .then(({ choice }) => {
      switch (choice) {
        case 'viewEmployees':
          viewEmployees()
          break
        case 'addEmployee':
          addEmployee()
          break
        case 'updateEmployeeRole':
          updateEmployeeRole()
          break
        case 'viewDepartments':
          viewDepartments()
          break
        case 'addDepartment':
          addDepartment()
          break
        case 'viewRoles':
          viewRoles()
          break
        case 'addRole':
          addRole()
          break
      }
    })
    .catch(err => console.log(err))
}

const viewEmployees = () => {
  db.query(`
    SELECT employee.id, employee.first_name, employee.last_name,
      role.title, role.salary, department.name AS department,
      CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN role
    ON employee.role_id = role.id
    LEFT JOIN department
    ON role.department_id = department.id
    LEFT JOIN employee manager
    ON manager.id = employee.manager_id
  `, (err, employee) => {
    if (err) { console.log(err) }
    console.table(employee)
    mainMenu()
  })
}

const addEmployee = () => {
  db.query('SELECT * FROM role', (err, roles) => {
    if (err) { console.log(err) }

    roles = roles.map(role => ({
      name: role.title,
      value: role.id
    }))

    db.query('SELECT * FROM employee', (err, employees) => {

      employees = employees.map(employee => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id
      }))
      
      employees.unshift({ name: 'None', value: null })

      prompt([
        {
          type: 'input',
          name: 'first_name',
          message: 'What is the employee first name?'
        },
        {
          type: 'input',
          name: 'last_name',
          message: 'What is the employee last name?'
        },
        {
          type: 'list',
          name: 'role_id',
          message: 'Choose a role for the employee:',
          choices: roles
        },
        {
          type: 'list',
          name: 'manager_id',
          message: 'Choose a manager for the employee:',
          choices: employees
        }
      ])
        .then(employee => {
          db.query('INSERT INTO employee SET ?', employee, (err) => {
            if (err) { console.log(err) }
            console.log('Employee Created!')
            mainMenu()
          })
        })
        .catch(err => console.log(err))
    })
  })
}

const updateEmployeeRole = () => {
  {
    db.query('SELECT * FROM role', (err, roles) => {
      if (err) { console.log(err) }
  
      roles = roles.map(role => ({
        name: role.title,
        value: role.id
      }))
  
      db.query('SELECT * FROM employee', (err, employees) => {
  
        employees = employees.map(employee => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id
        }))
        
        employees.unshift({ name: 'None', value: null })
  
        prompt([
          {
            type: 'list',
            name: 'Employee',
            message: 'Select an employee:',
            choices: employees
          },
          {
            type: 'list',
            name: 'EmployeeRole',
            message: 'Select a new role for the employee: ',
            choices: roles
          }
        ])
          .then(answers => {
            db.query('UPDATE employee SET role_id = ? WHERE id = ?', [answers.EmployeeRole, answers.Employee], (err) => {
              if (err) { console.log(err) }

              console.log('Employee Role Updated!')
              mainMenu()
            })
          })
          .catch(err => console.log(err))
      })
    })
  }
}

const viewDepartments = () => {
  db.query(`
  SELECT * FROM department
`, (err, departments) => {
  if (err) { console.log(err) }
  console.table(departments)
  mainMenu()
})
}

const addDepartment = () => {
  prompt ([
    {
      type: 'input',
      name: 'name', 
      message: 'What department do you want to add?',
    }
  ])
  .then(departments => {
    db.query('INSERT INTO department SET ?', departments, (err) => {
      if (err) { console.log(err) }
      console.log('Department Created!')
      mainMenu()
    })
  })
  .catch(err => console.log(err))
  
}

const viewRoles = () => {
  db.query(`
  SELECT * FROM role
`, (err, roles) => {
  if (err) { console.log(err) }
  console.table(roles)
  mainMenu()
})
}

const addRole = () => {
  prompt ([
    {
      type: 'input',
      name: 'title', 
      message: 'What is your title?',
    },
    {
      type: 'input',
      name: 'salary', 
      message: 'What is your salary?',
    },
    {
      type: 'input',
      name: 'department_id', 
      message: 'What is your department ID?',
    }
  ])
  .then(roles => {
    db.query('INSERT INTO role SET ?', roles, (err) => {
      if (err) { console.log(err) }
      console.log('Role Created!')
      mainMenu()
    })
  })
  .catch(err => console.log(err))
}

mainMenu()