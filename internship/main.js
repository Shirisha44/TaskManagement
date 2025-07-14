// ###### Event Listeners #####
$("#button-add").on("click", () => {
  enableFormCreateMode();
  clearForm();
  displayAddEditSection();
});

$("#arrow-back").on("click", () => {
  enableFormCreateMode();
  clearForm();
  displayViewSection();
});

$("#button-delete").on("click", function(event) {
  event.preventDefault();
  displayConfirmationDelete();
});

$("#button-save").on("click", function(event) {
  event.preventDefault();

  submitTask();
});

$("#button-create").on("click", function(event) {
  event.preventDefault();

  submitTask();
});

$("#button-confirm-yes").on("click", function(event) {
  event.preventDefault();
  hideConfirmationDelete();

  if (!$("#task-id").val()) return;

  let taskId = parseInt($("#task-id").val());

  deleteTask(taskId);
  updateView();
  displayViewSection();
});

$("#button-confirm-no").on("click", function(event) {
  event.preventDefault();
  hideConfirmationDelete();
});

$("#task-list").on("click", ".task", function() {
  let taskId = $(this).data("task-id");
  let task = getTaskById(taskId);

  if (!task) return;

  $("#task-id").val(task.id);
  $("#task-name").val(task.name);
  $("#task-description").val(decodeURIComponent(task.description));
  $("#task-priority").val(task.priority);

  let date = new Date(task.deadline);
  $("#task-day").val(date.getDate());
  $("#task-month").val(date.getMonth() + 1);
  $("#task-year").val(date.getFullYear());

  enableFormEditMode();
  displayAddEditSection();
});

// ###### Functions #####

function notify(message) {
  $("#notification").text(message);
  $("#notification").addClass("notification-animation");

  setTimeout(() => {
    $("#notification").removeClass("notification-animation");
  }, 2500);
}

function enableFormEditMode() {
  $(".form-edit-mode").show();
  $(".form-create-mode").hide();
}

function enableFormCreateMode() {
  $(".form-create-mode").show();
  $(".form-edit-mode").hide();
}

function clearForm() {
  $("#task-id").val("");
  $("#task-name").val("");
  $("#task-description").val("");
  $("#task-priority").val("");
  $(".input-error").hide();
  loadDataSelect();
}

function displayAddEditSection() {
  $("#arrow-back").css("visibility", "visible");
  $(".section-add-edit").show();
  $(".section-view").hide();
}

function displayViewSection() {
  $(".section-view").show();
  $(".section-add-edit").hide();
  $("#arrow-back").css("visibility", "hidden");
}

function displayConfirmationDelete() {
  $(".confirmation-delete").show();
  $("#button-confirm-no").focus();
  $(".crud-buttons").hide();
}

function hideConfirmationDelete() {
  $(".crud-buttons").show();
  $(".confirmation-delete").hide();
}

function updateView() {
  let tasks = getTasks(); // Fetch tasks from storage or database
  $("#task-list").empty(); // Clear the task list UI

  for (let i = 0; i < tasks.length; i++) {
    let task = tasks[i];
   
    // Check and format the deadline or use the created date as a fallback
    let formattedDate;
    if (!task.deadline || formatDate(task.deadline) === "Invalid Date") {
      console.warn(`Invalid or missing deadline for task: ${task.name}`);
      formattedDate = formatDate(task.createdDate) || "No Date Provided";
    } else {
      formattedDate = formatDate(task.deadline);
    }

    $("#task-list").append(`
      <li class="task-item">
        <div class="task task-priority-${task.priority.toLowerCase()} animation-expand" data-task-id="${task.id}">
          <div class="task-title"><h3>${task.name}</h3></div>
          <div class="task-deadline">${formattedDate}</div>
          <div class="task-priority">${task.priority}</div>
        </div>
      </li>
    `);
  }
}

function formatDate(strDate) {
  let date = new Date(strDate);
  if (isNaN(date.getTime()) || !strDate) {
    return "Invalid Date";
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}



function submitTask() {
  console.log("Submitting task...");

  const taskId = $("#task-id").val(); // Fetch task ID
  const task = {
    name: $("#task-name").val(),
    startDate: $("#task-start-date").val(), // Fetch start date
    endDate: $("#task-end-date").val(), // Fetch end date
    time: $("#task-time").val(), // Fetch time
    description: encodeURIComponent($("#task-description").val()), // Ensure the description is encoded
    priority: $("#task-priority").val(),
    whatsapp: $("#whatsapp-number").val(),
    createdDate: new Date().toISOString(), // Store the current date as the created date
  };

  console.log("Task Data before validation:", task);

  // Validate fields
  if (!validateFields(task)) return;

  // If task ID exists, update the task, otherwise create a new one
  if (taskId) {
    task.id = parseInt(taskId); // Add task ID if it's an existing task
    updateTask(task); // Update existing task
  } else {
    createTask(task); // Create new task
  }

  // Schedule notifications for the task
  scheduleNotification(task);

  // Update the task view
  updateView();
  displayViewSection();
}


function validateFields() {
  console.log("Validating fields...");
  if (!validateFieldByName("name")) return false;
  if (!validateFieldByName("start-date")) return false;
  if (!validateFieldByName("end-date")) return false;
  if (!validateFieldByName("time")) return false;
  if (!validateFieldByName("description")) return false;
  if (!validateFieldByName("priority")) return false;
  if (!validateDeadline()) return false;
  if (!$("#task-time").val()) {
    $("#task-time").focus();
    $("#input-error-time").show();
    return false;
  }  
  return true;
}

function validateFieldByName(fieldName) {
  if (!$(`#task-${fieldName}`).val()) {
    $(`#task-${fieldName}`).focus();
    $(`#input-error-${fieldName}`).show();
    return false;
  }

  $(`#input-error-${fieldName}`).hide();
  return true;
}

function validateDeadline() {
  try {
    let date = getTaskDate();
    $("#input-error-deadline").hide();
    return true;
  } catch {
    $("#task-day").focus();
    $("#input-error-deadline").show();
    return false;
  }
}

function getTaskDate() {
  let startDate = $("#task-start-date").val();
  if (!startDate) {
    throw new Error("Invalid Start Date");
  }

  let [year, month, day] = startDate.split('-').map(Number);
  return new Date(year, month - 1, day).toISOString();
}

function formatDate(strDate) {
  if (!strDate) {
    return "No Deadline";
  }

  let date = new Date(strDate);
  return isNaN(date.getTime()) ? "No Deadline" : date.toLocaleDateString();
}

function createTask(newTask) {
  console.log("Creating task:", newTask);
  newTask.id = getNewTaskId();

  let tasks = getTasks();
  tasks = [...tasks, newTask];

  updateTasks(tasks);
  notify("Task created successfully.");
}

function updateTask(taskToUpdate) {
  let tasks = getTasks();

  tasks = tasks.map(task => {
    return task.id === taskToUpdate.id ? taskToUpdate : task;
  });

  updateTasks(tasks);
  notify("Task updated successfully.");
}

function deleteTask(taskIdToDelete) {
  let tasks = getTasks();
  tasks = tasks.filter(task => task.id !== taskIdToDelete);

  updateTasks(tasks);
  notify("Task deleted successfully.");
}

function updateTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getTaskById(id) {
  let tasks = getTasks();
  return tasks.find(task => task.id === id);
}

function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function getNewTaskId() {
  let tasks = getTasks();
  if (!tasks.length) return 0;

  let lastId = tasks.map(task => task.id).reverse()[0];
  return lastId + 1;
}

function loadDataSelect() {
  let today = new Date();

  let currentDay = today.getDate();
  loadDayOptions(currentDay);

  let currentMonth = today.getMonth() + 1;
  $("#task-month").val(currentMonth);

  let currentYear = today.getFullYear();
  loadYearOptions(currentYear);
}

function loadDayOptions(currentDay) {
  for (let i = 1; i <= 31; i++) {
    let selected = "";
    if (currentDay === i) selected = "selected";
    $("#task-day").append(`<option value="${i}" ${selected}>${i}</option>`);
  }
}

function loadYearOptions(currentYear) {
  for (let i = currentYear; i <= currentYear + 10; i++) {
    let selected = "";
    if (currentYear === i) selected = "selected";
    $("#task-year").append(`<option value="${i}" ${selected}>${i}</option>`);
  }
}

// ###### Main #####
updateView();
loadDataSelect();

// Function to handle scheduling notifications for a task
function scheduleNotification(task) {
  if (!task.startDate || !task.endDate || !task.time) {
    console.error("Start Date, End Date, or Time is not defined for the task:", task);
    return;
  }

  const startDateTime = new Date(`${task.startDate}T${task.time}:00`);
  const endDateTime = new Date(`${task.endDate}T${task.time}:00`);
  const currentTime = new Date();

  // Ensure startDateTime is in the future
  if (startDateTime <= currentTime) {
    console.warn("Start date is in the past. Notifications will start from the next available time.");
    return; // This stops the scheduling if the start time is in the past
  }

  if (endDateTime <= startDateTime) {
    console.error("End Date must be after the Start Date.");
    return;
  }

  console.log(`Task "${task.name}" has been scheduled from ${startDateTime} to ${endDateTime}.`);

  // Function to calculate and schedule each notification
  function scheduleNextNotification(notificationTime) {
    // Debug: Log notification time
    console.log(`Scheduling next notification for task "${task.name}" at ${notificationTime}`);

    if (notificationTime > endDateTime) return; // Stop when beyond end date

    const delay = notificationTime - new Date();
    console.log(`Notification delay: ${delay}ms`);

    if (delay > 0) {
      setTimeout(() => {
        sendWhatsAppReminder(task); // Trigger the notification
        console.log(`Notification sent for task "${task.name}" at ${notificationTime}`);
        scheduleNextNotification(new Date(notificationTime.getTime() + 24 * 60 * 60 * 1000)); // Schedule next notification 24 hours later
      }, delay);
    } else {
      // If the current time has passed, schedule next notification 24 hours later
      scheduleNextNotification(new Date(notificationTime.getTime() + 24 * 60 * 60 * 1000));
    }
  }

  // Start scheduling notifications from the first valid notification time
  scheduleNextNotification(startDateTime);
}


// Function to send WhatsApp reminder
function sendWhatsAppReminder(task) {
  // Construct the WhatsApp reminder message
  let message = `Reminder: ${decodeURIComponent(task.description)} (Priority: ${task.priority})`;

  console.log("Sending WhatsApp reminder:", message);

  // Call backend service to send the WhatsApp message
  sendWhatsAppMessage(task.whatsapp, message);
}


function sendWhatsAppMessage(whatsappNumber, message) {
  $.ajax({
    url: "http://localhost:4000/send-whatsapp",
    type: "POST",
    data: JSON.stringify({ phoneNumber: whatsappNumber, message: message }),
    contentType: "application/json",
    success: function (response) {
      console.log("WhatsApp message sent successfully:", response);
    },
    error: function (error) {
      console.error("Error sending WhatsApp message:", error);
    },
  });
}
