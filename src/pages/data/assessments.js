export const assessments = [
    // ==================================================
    // JAVASCRIPT
    // ==================================================
  
    {
      id: "JS-EASY",
      skill: "JavaScript",
      difficulty: "Easy",
      questions: [
        {
          id: "JS001",
          type: "theory",
          question: "Which keyword declares a block-scoped variable in JavaScript?",
          options: ["var", "let", "define", "static"],
          answer: "let",
        },
        {
          id: "JS002",
          type: "theory",
          question: "Which method converts a JSON string into a JavaScript object?",
          options: [
            "JSON.parse()",
            "JSON.stringify()",
            "JSON.convert()",
            "JSON.object()",
          ],
          answer: "JSON.parse()",
        },
        {
          id: "JS003",
          type: "code-reading",
          question:
            "What is the value of x after this code executes?\n\nlet x = 5;\nx += 3;",
          options: ["2", "5", "8", "15"],
          answer: "8",
        },
        {
          id: "JS004",
          type: "coding",
          question:
            "Write a JavaScript function named add that returns the sum of two numbers.",
          starterCode: "return a + b;",
          sampleInput: "5, 3",
          expectedOutput: "8",
        },
      ],
    },
  
    // ==================================================
    // PYTHON
    // ==================================================
  
    {
      id: "PY-EASY",
      skill: "Python",
      difficulty: "Easy",
      questions: [
        {
          id: "PY001",
          type: "theory",
          question: "Which symbol is used to start a comment in Python?",
          options: ["//", "#", "/*", "--"],
          answer: "#",
        },
        {
          id: "PY002",
          type: "theory",
          question: "Which of the following is a Python list?",
          options: [
            "[1, 2, 3]",
            "(1, 2, 3)",
            "{1, 2, 3}",
            "<1, 2, 3>",
          ],
          answer: "[1, 2, 3]",
        },
        {
          id: "PY003",
          type: "code-reading",
          question:
            "What does len([10, 20, 30, 40]) return?",
          options: ["3", "4", "10", "40"],
          answer: "4",
        },
      ],
    },
  
    // ==================================================
    // JAVA
    // ==================================================
  
    {
      id: "JAVA-EASY",
      skill: "Java",
      difficulty: "Easy",
      questions: [
        {
          id: "JAVA001",
          type: "theory",
          question:
            "Which keyword is used to define a class in Java?",
          options: ["class", "struct", "object", "define"],
          answer: "class",
        },
        {
          id: "JAVA002",
          type: "theory",
          question:
            "Which method is the entry point of a Java application?",
          options: [
            "start()",
            "run()",
            "main()",
            "execute()",
          ],
          answer: "main()",
        },
        {
          id: "JAVA003",
          type: "code-reading",
          question:
            "What is the output of this Java statement?\n\nint x = 5;\nSystem.out.println(x + 5);",
          options: ["5", "10", "55", "Error"],
          answer: "10",
        },
      ],
    },
  
    // ==================================================
    // SQL
    // ==================================================
  
    {
      id: "SQL-EASY",
      skill: "SQL",
      difficulty: "Easy",
      questions: [
        {
          id: "SQL001",
          type: "theory",
          question:
            "Which SQL command is used to retrieve data from a table?",
          options: ["GET", "SELECT", "FETCH", "READ"],
          answer: "SELECT",
        },
        {
          id: "SQL002",
          type: "theory",
          question:
            "Which SQL clause is used to filter rows?",
          options: ["ORDER BY", "GROUP BY", "WHERE", "FILTER"],
          answer: "WHERE",
        },
        {
          id: "SQL003",
          type: "code-reading",
          question:
            "Which query correctly returns students whose score is greater than 80?",
          options: [
            "SELECT name FROM students WHERE score > 80;",
            "GET name FROM students IF score > 80;",
            "SELECT students WHERE score > 80;",
            "SELECT name WHERE students > 80;",
          ],
          answer:
            "SELECT name FROM students WHERE score > 80;",
        },
      ],
    },
  
    // ==================================================
    // PROGRAMMING FUNDAMENTALS
    // ==================================================
  
    {
      id: "PF-EASY",
      skill: "Programming Fundamentals",
      difficulty: "Easy",
      questions: [
        {
          id: "PF001",
          type: "theory",
          question:
            "Which data type is commonly used to store whole numbers?",
          options: ["Integer", "String", "Boolean", "Character"],
          answer: "Integer",
        },
        {
          id: "PF002",
          type: "theory",
          question:
            "What is the main purpose of an if statement?",
          options: [
            "To repeat code forever",
            "To make a decision based on a condition",
            "To store multiple values",
            "To define a database",
          ],
          answer: "To make a decision based on a condition",
        },
        {
          id: "PF003",
          type: "code-reading",
          question:
            "What is the output?\n\nint x = 10;\nif (x > 5) {\n  print('Yes');\n}",
          options: ["No", "Yes", "10", "Error"],
          answer: "Yes",
        },
      ],
    },
  
    // ==================================================
    // DATA STRUCTURES
    // ==================================================
  
    {
      id: "DS-EASY",
      skill: "Data Structures",
      difficulty: "Easy",
      questions: [
        {
          id: "DS001",
          type: "theory",
          question:
            "Which data structure follows the LIFO principle?",
          options: ["Queue", "Stack", "Array", "Graph"],
          answer: "Stack",
        },
        {
          id: "DS002",
          type: "theory",
          question:
            "Which data structure follows the FIFO principle?",
          options: ["Stack", "Queue", "Tree", "Heap"],
          answer: "Queue",
        },
        {
          id: "DS003",
          type: "code-reading",
          question:
            "If a stack contains [10, 20, 30] and 30 is removed first, which principle is being demonstrated?",
          options: [
            "FIFO",
            "LIFO",
            "Random access",
            "Binary search",
          ],
          answer: "LIFO",
        },
      ],
    },
  
    // ==================================================
    // WEB DEVELOPMENT
    // ==================================================
  
    {
      id: "WEB-EASY",
      skill: "Web Development",
      difficulty: "Easy",
      questions: [
        {
          id: "WEB001",
          type: "theory",
          question:
            "Which language is primarily used to structure the content of a web page?",
          options: ["HTML", "CSS", "JavaScript", "SQL"],
          answer: "HTML",
        },
        {
          id: "WEB002",
          type: "theory",
          question:
            "Which technology is primarily used to style a web page?",
          options: ["HTML", "CSS", "SQL", "Python"],
          answer: "CSS",
        },
        {
          id: "WEB003",
          type: "code-reading",
          question:
            "Which HTML element creates a hyperlink?",
          options: ["<link>", "<a>", "<href>", "<url>"],
          answer: "<a>",
        },
      ],
    },
  
    // ==================================================
    // REACT
    // ==================================================
  
    {
      id: "REACT-EASY",
      skill: "React",
      difficulty: "Easy",
      questions: [
        {
          id: "REACT001",
          type: "theory",
          question:
            "What is React primarily used for?",
          options: [
            "Building user interfaces",
            "Managing databases",
            "Writing SQL queries",
            "Operating systems",
          ],
          answer: "Building user interfaces",
        },
        {
          id: "REACT002",
          type: "theory",
          question:
            "Which hook is commonly used to manage state in a React component?",
          options: [
            "useState",
            "useDatabase",
            "useHTML",
            "useClass",
          ],
          answer: "useState",
        },
        {
          id: "REACT003",
          type: "code-reading",
          question:
            "What does this React code create?\n\nfunction App() {\n  return <h1>Hello</h1>;\n}",
          options: [
            "A heading element",
            "A database",
            "A CSS file",
            "A server",
          ],
          answer: "A heading element",
        },
      ],
    },
  
    // ==================================================
    // DATABASES
    // ==================================================
  
    {
      id: "DB-EASY",
      skill: "Databases",
      difficulty: "Easy",
      questions: [
        {
          id: "DB001",
          type: "theory",
          question:
            "What is the primary purpose of a database?",
          options: [
            "To store and manage data",
            "To style web pages",
            "To compile Java code",
            "To create images",
          ],
          answer: "To store and manage data",
        },
        {
          id: "DB002",
          type: "theory",
          question:
            "Which key uniquely identifies a record in a relational table?",
          options: [
            "Foreign key",
            "Primary key",
            "Candidate value",
            "Index value",
          ],
          answer: "Primary key",
        },
        {
          id: "DB003",
          type: "code-reading",
          question:
            "Which SQL command is used to add a new row to a table?",
          options: ["INSERT", "UPDATE", "ALTER", "CREATE"],
          answer: "INSERT",
        },
      ],
    },
  
    // ==================================================
    // PROBLEM SOLVING
    // ==================================================
  
    {
      id: "PS-EASY",
      skill: "Problem Solving",
      difficulty: "Easy",
      questions: [
        {
          id: "PS001",
          type: "theory",
          question:
            "What should you usually do first when solving a programming problem?",
          options: [
            "Understand the problem and requirements",
            "Write random code",
            "Delete the input",
            "Choose a programming language without analysis",
          ],
          answer: "Understand the problem and requirements",
        },
        {
          id: "PS002",
          type: "theory",
          question:
            "What is an algorithm?",
          options: [
            "A step-by-step procedure for solving a problem",
            "A database table",
            "A programming language",
            "A computer component",
          ],
          answer: "A step-by-step procedure for solving a problem",
        },
        {
          id: "PS003",
          type: "code-reading",
          question:
            "If a loop runs from 1 to 5 and prints each number, how many numbers are printed?",
          options: ["4", "5", "6", "10"],
          answer: "5",
        },
      ],
    },
  ];
  
  export const assessmentSettings = {
    theoryWeight: 40,
    codeWeight: 60,
    scale: 100,
    timerMinutes: 15,
  };