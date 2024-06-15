document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['redditVersion'], function(result) {
      if (result.redditVersion) {
        document.querySelector(`button[value="
          ${result.redditVersion}"]`).classList.add('selected');
      }
      console.log("Initial version setting: ", result.redditVersion);
    });

    document.querySelectorAll('button[name="version"]').forEach(button => {
      button.addEventListener('click', function() {
        const version = this.value;
        chrome.storage.local.set({ redditVersion: version }, function() {
          console.log("Version set to: ", version);

          // Update button styles to reflect the current selection
          document.querySelectorAll('button[name="version"]').forEach(btn =>
            btn.classList.remove('selected'));
          this.classList.add('selected');
        }.bind(this));
      });
    });
  });
