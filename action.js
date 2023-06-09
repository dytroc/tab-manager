const groupsDictionary = {
    "youtube.com": "유튜브",
    "namu.wiki": "나무위키",
    "pixiv.net": "픽시브",
    "github.com": "깃허브"
};

const groupColors = {
    "유튜브": "red",
    "나무위키": "green",
    "픽시브": "cyan",
    "깃허브": "purple"
};

document.getElementById("manage-tabs")?.addEventListener("click", async () => {
    const tabs = await chrome.tabs.query({});

    const assignedGroups = {};
    const groups = (await chrome.tabGroups.query({})).reduce((acc, { title, id }) => ({ ...acc, [title]: id }), {});
    const flipped = Object.fromEntries(Object.entries(groups).map(([key, value]) => [value, key]))

    tabs.forEach(({ groupId, id, url }) => {
        if (!flipped[groupId] || order.includes(flipped[groupId])) {
            const { domain } = psl.parse((new URL(url)).hostname);

            const dict = groupsDictionary[domain] ?? '그 외';

            assignedGroups[dict] = [...(assignedGroups[dict] ?? []), id];
        }
    });

    const entries = Object.entries(assignedGroups).sort(([a], [b]) => order.indexOf(a) - order.indexOf(b));
    
    for (const [group, tabIds] of entries) {
        const existingGroup = groups[group];

        const groupId = existingGroup ?? await chrome.tabs.group({ tabIds })

        if (existingGroup) await chrome.tabs.group({ tabIds, groupId });
        else await chrome.tabGroups.update(groupId, { title: group, color: groupColors[group] ?? 'grey' });

        await chrome.tabGroups.move(groupId, { index: -1 });
    }
});

const order = [...Object.values(groupsDictionary), '그 외'];