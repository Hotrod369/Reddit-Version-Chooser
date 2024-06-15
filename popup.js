document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['redditVersion'], function(result) {
    if (result.redditVersion) {
      document.querySelector(
        `button[value="${result.redditVersion}"]`).classList.add('selected');
    }
    console.log("Initial version setting: ", result.redditVersion);
  });

  document.querySelectorAll('button[name="version"]').forEach(button => {
    button.addEventListener('click', function() {
      const version = this.value;
      chrome.storage.local.set({ redditVersion: version }, function() {
        console.log("Version set to: ", version);
        updateCurrentTabUrl(version);
      });

      // Update button styles to reflect the current selection
      document.querySelectorAll(
        'button[name="version"]').forEach(btn => btn.classList.remove('selected'));
      this.classList.add('selected');
    });
  });
});

function updateCurrentTabUrl(version) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    if (currentTab && currentTab.url.includes("reddit.com") &&
        !currentTab.url.includes("mod.reddit.com") &&
        !currentTab.url.includes("/media")) {

      let newUrl = currentTab.url;
      if (version === 'new') {
        newUrl = newUrl.replace(/^(https?:\/\/)(www|old)\.reddit\.com/, "$1new.reddit.com");
      } else if (version === 'old') {
        newUrl = newUrl.replace(/^(https?:\/\/)(www|new)\.reddit\.com/, "$1old.reddit.com");
      } else {
        newUrl = newUrl.replace(/^(https?:\/\/)(new|old)\.reddit\.com/, "$1www.reddit.com");
      }

      chrome.tabs.update(currentTab.id, { url: newUrl }, function(tab) {
        retryIfFailed(tab, newUrl, 3);
      });
    }
  });
}

function retryIfFailed(tab, url, retries) {
  chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
    if (tabId === tab.id && changeInfo.status === 'complete') {
      chrome.tabs.onUpdated.removeListener(listener);
      console.log('Page loaded successfully.');
    } else if (tabId === tab.id && changeInfo.status === 'loading' && retries > 0) {
      setTimeout(() => {
        console.log(`Retrying... (${retries} attempts left)`);
        chrome.tabs.update(tab.id, { url: url });
        retryIfFailed(tab, url, retries - 1);
      }, 3000); // wait 3 seconds before retrying
    } else if (retries === 0) {
      chrome.tabs.onUpdated.removeListener(listener);
      console.log('Failed to load page after retries.');
      notifyUserFailure();
    }
  });
}

function notifyUserFailure() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Reddit Version Chooser',
    message: 'Failed to load the selected version of Reddit after multiple attempts.',
  });
}
