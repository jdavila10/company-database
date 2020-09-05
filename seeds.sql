USE employee_db;

INSERT INTO department (name)
VALUES
    ("Sales"),
    ("IT"),
    ("Engineering"),
    ("Finance");

INSERT INTO role (title, salary, department_id)
VALUES
    ("Sales Executive", 80000, 1),
    ("Director of Sales", 140000, 1),
    ("IT", 90000, 2),
    ("IT Director", 150000, 2),
    ("Full Stack Developer", 120000, 3),
    ("CTO", 200000, 3),
    ("Accountant", 100000, 4),
    ("VP of Finance", 180000, 4);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES
    (101, "John", "Murphy", 2, NULL),
    (102, "Matthew", "Frasier", 4, NULL),
    (103, "Peggy", "Renteria", 6, NULL),
    (104, "Marco", "Toledo", 8, NULL),
    (105, "Michael", "Vandez", 1, 101),
    (106, "Tyler", "Brown", 3, 102),
    (107, "Alex", "Torres", 5, 103),
    (108, "Kim", "Scarboro", 7, 104);