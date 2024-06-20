document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['applyGlobally'], function(result) {
    if (result.applyGlobally !== undefined) {
      document.getElementById('globalSetting').checked = result.applyGlobally;
    }
    console.log("Initial settings: ", result);
    updateVersionUI();
  });

  document.querySelectorAll('button[name="version"]').forEach(button => {
    button.addEventListener('click', function() {
      const version = this.value;
      const applyGlobally = document.getElementById('globalSetting').checked;
      
      if (applyGlobally) {
        chrome.storage.local.set({ redditVersion: version }, function() {
          console.log("Global version set to: ", version);
          chrome.runtime.sendMessage({ type: 'updateRules', version });
        });
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          const currentTabId = tabs[0].id;
          const storageKey = `redditVersion_${currentTabId}`;
          chrome.storage.local.set({ [storageKey]: version }, function() {
            console.log(`Version for tab ${currentTabId} set to: ${version}`);
            updateCurrentTabUrl(version);
          });
        });
      }

      document.querySelectorAll('button[name="version"]').forEach(btn => btn.classList.remove('selected'));
      this.classList.add('selected');
    });
  });

  document.getElementById('globalSetting').addEventListener('change', function() {
    const applyGlobally = this.checked;
    chrome.storage.local.set({ applyGlobally: applyGlobally }, function() {
      console.log("Apply globally set to: ", applyGlobally);
      if (applyGlobally) {
        chrome.storage.local.get('redditVersion', function(result) {
          chrome.runtime.sendMessage({ type: 'updateRules', version: result.redditVersion });
        });
      } else {
        chrome.runtime.sendMessage({ type: 'clearRules' });
        updateVersionUI();
      }
    });
  });
});

function updateVersionUI() {
  const applyGlobally = document.getElementById('globalSetting').checked;
  if (applyGlobally) {
    chrome.storage.local.get('redditVersion', function(result) {
      if (result.redditVersion) {
        document.querySelector(`button[value="${result.redditVersion}"]`).classList.add('selected');
      }
    });
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const currentTabId = tabs[0].id;
      const storageKey = `redditVersion_${currentTabId}`;
      chrome.storage.local.get(storageKey, function(result) {
        if (result[storageKey]) {
          document.querySelector(`button[value="${result[storageKey]}"]`).classList.add('selected');
        }
      });
    });
  }
}

function updateCurrentTabUrl(version) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    if (currentTab && currentTab.url.includes("reddit.com") &&
        !currentTab.url.includes("mod.reddit.com") &&
        !currentTab.url.includes("/mod") &&
        !currentTab.url.includes("/media")) {

      let newUrl = currentTab.url;
      console.log(`Current URL: ${currentTab.url}`);

      if (version === 'new') {
        newUrl = newUrl.replace(/^(https?:\/\/)(www|old|sh)\.reddit\.com/, "$1new.reddit.com");
      } else if (version === 'old') {
        newUrl = newUrl.replace(/^(https?:\/\/)(www|new|sh)\.reddit\.com/, "$1old.reddit.com");
      } else {
        newUrl = newUrl.replace(/^(https?:\/\/)(new|old|sh)\.reddit\.com/, "$1sh.reddit.com");
      }

      console.log(`Transformed URL for version '${version}': ${newUrl}`);

      if (newUrl !== currentTab.url) {
        console.log(`Updating tab URL from '${currentTab.url}' to '${newUrl}'`);
        chrome.tabs.update(currentTab.id, { url: newUrl }, function(tab) {
          retryIfFailed(tab, newUrl, 3);
        });
      }
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
  if (chrome.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Reddit Version Chooser',
      message: 'Failed to load the selected version of Reddit after multiple attempts.',
    }, function(notificationId) {
      if (chrome.runtime.lastError) {
        console.error('Error creating notification:', chrome.runtime.lastError);
      }
    });
  } else {
    console.error('Notifications API not available');
  }
}
