document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['redditVersion'], function(result) {
    if (result.redditVersion) {
      const version = result.redditVersion.trim();
      const button = document.querySelector(`button[value="${version}"]`);
      if (button) {
        button.classList.add('selected');
      } else {
        console.error(`Button with value "${version}" not found.`);
      }
    }
    console.log("Initial version setting: ", result.redditVersion);
  });

  document.querySelectorAll('button[name="version"]').forEach(button => {
    button.addEventListener('click', function() {
      const version = this.value.trim();
      chrome.storage.local.set({ redditVersion: version }, function() {
        console.log("Version set to: ", version);

        // Update button styles to reflect the current selection
        document.querySelectorAll('button[name="version"]').forEach(btn => btn.classList.remove('selected'));
        this.classList.add('selected');
      }.bind(this));
    });
  });
});
