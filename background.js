chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['redditVersion'], (result) => {
    const version = result.redditVersion || 'www';
    updateRules(version);
  });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.redditVersion) {
    const newVersion = changes.redditVersion.newValue;
    updateRules(newVersion);
  }
});

function updateRules(version) {
  const rules = [];

  if (version === 'new') {
    rules.push({
      id: 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          transform: {
            scheme: 'https',
            host: 'new.reddit.com'
          }
        }
      },
      condition: {
        urlFilter: '*://*.reddit.com/*', resourceTypes: ['main_frame']
      }
    });
  } else if (version === 'old') {
    rules.push({
      id: 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          transform: {
            scheme: 'https',
            host: 'old.reddit.com'
          }
        }
      },
      condition: {
        urlFilter: '*://*.reddit.com/*', resourceTypes: ['main_frame']
      }
    });
  } else {
    rules.push({
      id: 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          transform: {
            scheme: 'https',
            host: 'www.reddit.com'
          }
        }
      },
      condition: {
        urlFilter: '*://*.reddit.com/*', resourceTypes: ['main_frame']
      }
    });
  }

  // Add rules to exclude mod.reddit.com and URLs containing /media from being redirected
  rules.push({
    id: 2,
    priority: 2,
    action: {
      type: 'allow'
    },
    condition: {
      urlFilter: '*://mod.reddit.com/*',
      resourceTypes: ['main_frame']
    }
  });

  rules.push({
    id: 3,
    priority: 2,
    action: {
      type: 'allow'
    },
    condition: {
      urlFilter: '*://*.reddit.com/media*', resourceTypes: ['main_frame']
    }
  });

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2, 3],
    addRules: rules
  });
}
