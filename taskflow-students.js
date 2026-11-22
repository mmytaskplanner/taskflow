
/* TASKFLOW - STUDENT PROJECT MONITORING SYSTEM */

(() => {
  "use strict";

  const STORAGE_KEY = "taskflow_student_records";

  let students = [];

  try {
    students = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(students)) students = [];
  } catch {
    students = [];
  }

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  };

  const style = document.createElement("style");
  style.textContent = `
    #student-monitor {
      margin: 30px auto;
      padding: 24px;
      max-width: 1100px;
      background: white;
      border-radius: 15px;
      color: #24334d;
      box-shadow: 0 4px 18px rgba(0,0,0,.06);
      font-family: Arial, sans-serif;
    }
    #student-monitor input,
    #student-monitor textarea,
    #student-monitor select {
      width: 100%;
      padding: 11px;
      margin: 6px 0 14px;
      border: 1px solid #dce3ee;
      border-radius: 8px;
      box-sizing: border-box;
    }
    #student-monitor button {
      padding: 10px 15px;
      border: 0;
      border-radius: 8px;
      cursor: pointer;
      margin: 4px;
      font-weight: 600;
    }
    .sm-primary { background: #2563eb; color: white; }
    .sm-secondary { background: #edf2f8; color: #334155; }
    .sm-delete { background: #fee2e2; color: #b91c1c; }
    .sm-card {
      border: 1px solid #e5eaf2;
      border-radius: 10px;
      padding: 16px;
      margin: 12px 0;
    }
    .sm-muted { color: #778399; font-size: 13px; }
    .sm-task {
      padding: 12px;
      margin: 8px 0;
      background: #f6f8fc;
      border-radius: 8px;
    }
    .sm-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
      gap: 12px;
    }
    #student-monitor label {
      font-weight: 600;
      font-size: 13px;
    }
  `;
  document.head.appendChild(style);

  const app = document.createElement("section");
  app.id = "student-monitor";

  app.innerHTML = `
    <h2>Student Project Monitoring</h2>
    <p class="sm-muted">
      Monitor student projects, accomplishments, and evaluations.
    </p>

    <div class="sm-grid">
      <div class="sm-card">
        <h3 id="sm-total">0</h3>
        <p class="sm-muted">Total Students</p>
      </div>
      <div class="sm-card">
        <h3 id="sm-projects">0</h3>
        <p class="sm-muted">Total Projects</p>
      </div>
      <div class="sm-card">
        <h3 id="sm-completed">0</h3>
        <p class="sm-muted">Completed Tasks</p>
      </div>
    </div>

    <hr>

    <h3>Register Student Project</h3>

    <form id="sm-form">
      <label>Student Name</label>
      <input id="sm-name" required placeholder="Enter full name">

      <label>Section</label>
      <input id="sm-section" required placeholder="Enter section">

      <label>Project Title</label>
      <input id="sm-project" required placeholder="Enter project title">

      <button class="sm-primary" type="submit">
        Save Student Record
      </button>
    </form>

    <hr>

    <h3>Student Records</h3>
    <input id="sm-search" placeholder="Search student or project...">

    <div id="sm-list"></div>

    <hr>

    <h3>Backup and Reports</h3>
    <button class="sm-secondary" id="sm-export">
      Export Student Records
    </button>
    <button class="sm-secondary" id="sm-print">
      Print Page
    </button>
  `;

  const main = document.querySelector("main");
  if (main) main.appendChild(app);
  else document.body.appendChild(app);

  const $ = id => document.getElementById(id);

  function updateDashboard() {
    $("sm-total").textContent = students.length;
    $("sm-projects").textContent = students.length;

    $("sm-completed").textContent =
      students.reduce((sum, s) =>
        sum + s.tasks.filter(t => t.status === "Completed").length, 0);
  }

  function render() {
    const list = $("sm-list");
    list.innerHTML = "";

    const search = $("sm-search").value.toLowerCase();

    const filtered = students.filter(s =>
      `${s.name} ${s.section} ${s.project}`
        .toLowerCase().includes(search)
    );

    filtered.forEach(student => {
      const card = document.createElement("div");
      card.className = "sm-card";

      const heading = document.createElement("h3");
      heading.textContent = student.name;

      const info = document.createElement("p");
      info.className = "sm-muted";
      info.textContent =
        `Section: ${student.section} | Project: ${student.project}`;

      const taskTitle = document.createElement("h4");
      taskTitle.textContent = "Task Accomplishments";

      card.append(heading, info, taskTitle);

      student.tasks.forEach(task => {
        const taskBox = document.createElement("div");
        taskBox.className = "sm-task";

        const title = document.createElement("strong");
        title.textContent = task.title;

        const description = document.createElement("p");
        description.textContent = task.description;

        const status = document.createElement("p");
        status.className = "sm-muted";
        status.textContent =
          `${task.status} | Date: ${task.date || "Not set"}`;

        const editTask = document.createElement("button");
        editTask.className = "sm-secondary";
        editTask.textContent = "Edit Task";
        editTask.onclick = () => addTask(student, task);

        const deleteTask = document.createElement("button");
        deleteTask.className = "sm-delete";
        deleteTask.textContent = "Delete Task";
        deleteTask.onclick = () => {
          if (confirm("Delete this task?")) {
            student.tasks = student.tasks.filter(t => t.id !== task.id);
            save();
            render();
          }
        };

        taskBox.append(
          title, description, status, editTask, deleteTask
        );
        card.appendChild(taskBox);
      });

      const addTaskButton = document.createElement("button");
      addTaskButton.className = "sm-primary";
      addTaskButton.textContent = "+ Add Task";
      addTaskButton.onclick = () => addTask(student);

      const evaluationButton = document.createElement("button");
      evaluationButton.className = "sm-secondary";
      evaluationButton.textContent = "Professor Evaluation";
      evaluationButton.onclick = () => evaluate(student);

      const deleteStudent = document.createElement("button");
      deleteStudent.className = "sm-delete";
      deleteStudent.textContent = "Delete Student";
      deleteStudent.onclick = () => {
        if (confirm("Delete this student and all their records?")) {
          students = students.filter(s => s.id !== student.id);
          save();
          render();
        }
      };

      card.append(
        addTaskButton,
        evaluationButton,
        deleteStudent
      );

      list.appendChild(card);
    });

    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "sm-muted";
      empty.textContent = "No student records found.";
      list.appendChild(empty);
    }

    updateDashboard();
  }

  $("sm-form").addEventListener("submit", e => {
    e.preventDefault();

    students.push({
      id: crypto.randomUUID(),
      name: $("sm-name").value.trim(),
      section: $("sm-section").value.trim(),
      project: $("sm-project").value.trim(),
      tasks: [],
      evaluation: {
        rating: "",
        grade: "",
        remarks: "",
        recommendations: ""
      }
    });

    save();
    e.target.reset();
    render();
    alert("Student project successfully registered!");
  });

  function addTask(student, existing = null) {
    const title = prompt(
      "Enter task title:",
      existing ? existing.title : ""
    );
    if (title === null || !title.trim()) return;

    const description = prompt(
      "Describe the task:",
      existing ? existing.description : ""
    );
    if (description === null) return;

    const status = prompt(
      "Status: Completed, Ongoing, or Pending",
      existing ? existing.status : "Completed"
    );
    if (status === null) return;

    const validStatus = ["Completed", "Ongoing", "Pending"]
      .find(s => s.toLowerCase() === status.trim().toLowerCase());

    if (!validStatus) {
      alert("Invalid task status.");
      return;
    }

    const date = prompt(
      "Date completed (YYYY-MM-DD):",
      existing ? existing.date : new Date().toISOString().slice(0, 10)
    );
    if (date === null) return;

    const task = {
      id: existing ? existing.id : crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      status: validStatus,
      date: date.trim()
    };

    if (existing) {
      student.tasks = student.tasks.map(t =>
        t.id === existing.id ? task : t
      );
    } else {
      student.tasks.push(task);
    }

    save();
    render();
  }

  function evaluate(student) {
    const evaluation = student.evaluation;

    const rating = prompt(
      "Project Evaluation: Excellent, Satisfactory, Needs Improvement, Incomplete",
      evaluation.rating
    );
    if (rating === null) return;

    const grade = prompt("Enter score or grade:", evaluation.grade);
    if (grade === null) return;

    const remarks = prompt("Professor's Remarks:", evaluation.remarks);
    if (remarks === null) return;

    const recommendations = prompt(
      "Recommendations for Improvement:",
      evaluation.recommendations
    );
    if (recommendations === null) return;

    student.evaluation = {
      rating,
      grade,
      remarks,
      recommendations
    };

    save();
    alert("Professor evaluation saved!");
  }

  $("sm-search").addEventListener("input", render);

  $("sm-export").addEventListener("click", () => {
    const blob = new Blob(
      [JSON.stringify(students, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "taskflow-student-backup.json";
    link.click();
    URL.revokeObjectURL(url);
  });

  $("sm-print").addEventListener("click", () => window.print());

  render();
})();
