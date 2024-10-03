import { render } from "ejs";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://stackoverflow.com/a/13627586
function nth(i) {
    let j = i % 10,
        k = i % 100;
    if (j === 1 && k !== 11) {
        return i + "st";
    }
    if (j === 2 && k !== 12) {
        return i + "nd";
    }
    if (j === 3 && k !== 13) {
        return i + "rd";
    }
    return i + "th";
}

async function get_rootme_stats() {
    const res = await fetch("https://api.www.root-me.org/auteurs/256088", {
        headers: {
            Cookie: `api_key=${process.env.ROOTME_TOKEN}`,
        },
    });
    const profile = await res.json();

    return {
        score: profile.score,
        ranking: nth(profile.position),
        rank: profile.rang,
    };
}

async function get_hackthebox_stats() {
    const res = await fetch("https://www.hackthebox.com/api/v4/profile/444974", {
        headers: {
            Authorization: `Bearer ${process.env.HTB_TOKEN}`,
        },
    });
    const profile = await res.json();

    return {
        ranking: nth(profile.profile.ranking),
        rank: profile.profile.rank,
        rank_ownership: profile.profile.rank_ownership,
    };
}

async function get_codingame_stats() {
    const res = await fetch(
        "https://www.codingame.com/services/CodinGamer/findRankingPoints",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: "[3532429]",
        },
    );
    const profile = await res.json();

    return {
        ranking: nth(profile.globalPointsRankGlobal),
        globalRank:
            Math.ceil((profile.globalPointsRankGlobal / profile.totalCodingamerGlobal.global) * 1000) / 10,
    };
}

async function get_stats() {
    return {
        rootme: await get_rootme_stats(),
        htb: await get_hackthebox_stats(),
        cg: await get_codingame_stats(),
    };
}

(async () => {
    const file = resolve(__dirname, "template.md");

    const stats = await get_stats();

    // Test data
    // const stats = {
    //     rootme: { score: '4605', ranking: '1442nd', rank: 'enthusiast' },
    //     htb: { ranking: '867th', rank: 'Hacker', rank_ownership: 4.1 },
    //     cg: { ranking: '4403rd', globalRank: 0.6 }
    // }

    console.log(render(readFileSync(file, "utf-8").trim(), stats));
})();