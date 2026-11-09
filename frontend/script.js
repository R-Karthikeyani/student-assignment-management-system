const assignmentForm = document.getElementById("assignmentForm");
const assignmentTitle = document.getElementById("assignmentTitle");
const dueDate = document.getElementById("dueDate");
const assignmentList = document.getElementById("assignmentList");

assignmentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const listItem = document.createElement("li");
  listItem.textContent = `${assignmentTitle.value} — due ${dueDate.value}`;
  assignmentList.appendChild(listItem);

  assignmentForm.reset();
});