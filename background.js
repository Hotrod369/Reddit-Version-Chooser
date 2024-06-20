chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['redditVersion', 'applyGlobally'], (result) => {
    const version = result.redditVersion || 'sh';
    const applyGlobally = result.applyGlobally !== undefined ? result.applyGlobally : true;
    updateRules(version, applyGlobally);
  });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.redditVersion || changes.applyGlobally) {
    chrome.storage.local.get(['redditVersion', 'applyGlobally'], (result) => {
      const version = result.redditVersion || 'sh';
      const applyGlobally = result.applyGlobally !== undefined ? result.applyGlobally : true;
      updateRules(version, applyGlobally);
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateRules') {
    chrome.storage.local.get('applyGlobally', function(result) {
      if (result.applyGlobally) {
        updateRules(message.version, true);
      }
    });
  } else if (message.type === 'clearRules') {
    updateRules(null, false);
  }
});

function updateRules(version, applyGlobally) {
  const rules = [];

  if (applyGlobally && version) {
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
          urlFilter: '*://*.reddit.com/*',
          resourceTypes: ['main_frame']
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
          urlFilter: '*://*.reddit.com/*',
          resourceTypes: ['main_frame']
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
              host: 'sh.reddit.com'
            }
          }
        },
        condition: {
          urlFilter: '*://*.reddit.com/*',
          resourceTypes: ['main_frame']
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
        urlFilter: '*://*.reddit.com/media*',
        resourceTypes: ['main_frame']
      }
    });

    rules.push({
      id: 4,
      priority: 2,
      action: {
        type: 'allow'
      },
      condition: {
        urlFilter: '*://*.reddit.com/mod*',
        resourceTypes: ['main_frame']
      }
    });
  }

  console.log('Updating rules:', JSON.stringify(rules, null, 2));
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2, 3, 4],
    addRules: rules
  });
}
