document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveOptions').addEventListener('click', saveOptions);

function saveOptions() {
  const enableFiltering = document.getElementById('enableFiltering').checked;
  // Get values of other settings here

  chrome.storage.sync.set({
    enableFiltering: enableFiltering
    // Save other settings here
  }, function() {
    const status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1500); // Display message for 1.5 seconds
  });
}

function restoreOptions() {
  chrome.storage.sync.get(['enableFiltering'], function(items) {
    // Restore the value of the enableFiltering checkbox, defaulting to true
    document.getElementById('enableFiltering').checked = items.enableFiltering !== undefined ? items.enableFiltering : true;
    // Restore values of other settings here
  });
}