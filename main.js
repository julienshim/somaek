Array.prototype.getSum = function () {
  return this.reduce((acc, cur) => acc + cur, 0);
};

class Player {
  constructor(name, results, answers) {
    this.name = name;
    this.answers = answers;
    this.hasPlayed = results.length > 0;
    this.results = this.getExpandedResultsObject(results);
    this.adjustedResults = this.getUserAdjustedResults();
  }

  // MARK: CLASS INDIVIDUAL RESULTS
  getEarlyBirdCount() {
    return this.results.filter((result) => result.postOrder === 1).length;
  }
  getFashionablyLateCount() {
    return this.results.filter((result) => result.postOrder === 5).length;
  }
  getSurgeonCount() {
    return this.results.filter(
      (result) =>
        result.score !== "X" &&
        result.score !== "N" &&
        !result.attempts.includes("🟨")
    ).length;
  }
  getLostInTheWoodsCount() {
    return this.results
      .map((result) => {
        const tmp = [...result.attempts.split(" ")].map((guess) =>
          guess.includes("🟩")
        );
        return tmp.indexOf(true);
      })
      .getSum();
  }
  getPsychicCount() {
    return this.results
      .filter((result) => result.score !== "N")
      .map(
        (result) =>
          [...result.attempts.split(" ")[0]].filter((box) => box === "🟩")
            .length
      )
      .getSum();
  }
  getSwingsAndMissesCount() {
    const missesArr = this.results
      .map((result) =>
        result.attempts.split(" ").filter((block) => block === "⬛⬛⬛⬛⬛")
      )
      .filter((block) => block.length);
    return missesArr.length;
  }

  // MARK: CLASS HELPER FUNCTIONS
  getAllValidGameIds() {
    return this.answers.map((answer) => answer.id);
  }
  getValidGameIdsByWeek(weekNumber) {
    const start = (weekNumber - 1) * 7;
    const end = start + 7;
    return this.answers.slice(start, end).map((answer) => answer.id);
  }
  getUserAdjustedResults() {
    const validGameIdsAllTime = this.getAllValidGameIds();
    const adjustedResults = [];
    for (let validGameId of validGameIdsAllTime) {
      const validGameIdExistsSearchResults = this.results.filter(
        (result) => result.id === validGameId
      );
      if (validGameIdExistsSearchResults.length > 0) {
        adjustedResults.push(validGameIdExistsSearchResults[0]);
      } else {
        adjustedResults.push({
          id: validGameId,
          score: "N",
          attempts: "",
          postOrder: 0,
        });
      }
    }
    return adjustedResults;
  }

  // MARK: CLASS ALL TIME RESULTS
  getGuessAverageAllTime() {
    const totalGuesses = this.results
      .map((result) => (result.score === "X" ? 7 : +result.score))
      .getSum();
    const totalPlayed = this.results.length;
    return this.hasPlayed ? totalGuesses / totalPlayed : "Has Not Played";
  }
  getWinPercentageAllTime() {
    const totalWins = this.results.filter(
      (result) => result.score !== "X"
    ).length;
    const totalPlayed = this.results.length;
    return (totalWins / totalPlayed) * 100;
  }
  getMaxStreak() {
    let max = 0;
    let currentStreak = 0;
    for (let result of this.adjustedResults) {
      if (result.score !== "X" && result.score !== "N") {
        currentStreak += 1;
      } else {
        currentStreak = 0;
      }
      if (currentStreak > max) {
        max = currentStreak;
      }
    }
    return this.hasPlayed ? max : 0;
  }
  getCurrentStreak() {
    const scoresArrReversed = this.adjustedResults
      .map((result) => result.score)
      .reverse();
    const indexOfX = scoresArrReversed.indexOf("X");
    const indexOfN = scoresArrReversed.indexOf("N");
    if (this.hasPlayed) {
      if (indexOfX === -1 && indexOfN !== -1) {
        return indexOfN;
      } else if (indexOfN === -1 && indexOfX !== -1) {
        return indexOfX;
      } else if (indexOfN > -1 && indexOfX > -1) {
        return indexOfN < indexOfX ? indexOfN : indexOfX;
      } else {
        return this.adjustedResults.length;
      }
    }
    return 0;
  }

  // MARK: CLASS WEEKLY RESULTS
  getGamesPlayedCountByWeek(weekNumber) {
    const validGameIdsByWeek = this.getValidGameIdsByWeek(weekNumber);
    return this.results.filter((result) =>
      validGameIdsByWeek.includes(result.id)
    ).length;
  }
  getAverageGuessByWeek(weekNumber) {
    const start = (weekNumber - 1) * 7;
    const end = start + 7;
    const totalGuesses = this.adjustedResults
      .slice(start, end)
      .filter((result) => result.score !== 'N')
      .map((result) => (result.score === "X" ? 7 : +result.score))
      .getSum();
    const totalPlayed = this.adjustedResults.slice(start, end).length;
    return this.hasPlayed ? totalGuesses / totalPlayed : "Has Not Played";
  }

  // MARK: CLASS EXPANDED RESULTS
  handleResultsSplitting(results) {
    const resultsArr = results.split(" ");
    const id = resultsArr[1];
    const score = resultsArr[2].split("/")[0];
    const attempts = resultsArr.slice(3).join(" ");
    return { id: +id, score, attempts };
  }
  getExpandedResultsObject(results) {
    if (results.length) {
      return results.map((result) => {
        const { results, postOrder } = result;
        return { ...this.handleResultsSplitting(results), postOrder };
      });
    }
    return [];
  }
}

// MARK: MAIN
let data = undefined;
const players = [];
const loadPlayers = () => {
  const keys = Object.keys(data.players).sort();
  for (let key of keys) {
    const player = new Player(key, data.players[key].results, data.answers);
    players.push(player);
  }
};
const displayPlayers = () => {
  const playersAccordion = document.getElementById("playersAccordion");
  playersAccordion.innerHTML = getPlayersAccordionHTML();
};
const getPlayersAccordionHTML = () => {
  const weekNumber = document.getElementById("weekNumber");
  const currentWeek = Math.ceil(data.answers.length / 7);
  const playerAverageGuessByWeekSortedArr = players
    .map((player) => player.getAverageGuessByWeek(currentWeek))
    .sort((a, b) => a - b);
  weekNumber.innerText = currentWeek;
  return players
    .sort(
      (a, b) =>
        a.getAverageGuessByWeek(currentWeek) -
        b.getAverageGuessByWeek(currentWeek)
    )
    .map((player, index) => {
      const playerRank = playerAverageGuessByWeekSortedArr.indexOf(player.getAverageGuessByWeek(currentWeek)) + 1;
      const gamesPlayedTieBreakerArr = players.filter(otherPlayer => player.getAverageGuessByWeek(currentWeek) === otherPlayer.getAverageGuessByWeek(currentWeek)).map(player => player.getGamesPlayedCountByWeek(currentWeek));
      const adjustedPlayerRank = gamesPlayedTieBreakerArr.indexOf(player.getGamesPlayedCountByWeek(currentWeek))
      const tiePreFix = gamesPlayedTieBreakerArr.filter(gamesPlayed => gamesPlayed === player.getGamesPlayedCountByWeek(currentWeek)).length > 1
          ? "T"
          : "";
      return `<div class='accordion-item'>
            <h2 class='accordion-header' id='heading${index}'>
            <button class='accordion-button' type='button' data-bs-toggle='collapse' data-bs-target='#collapse${index}' aria-expanded='true' aria-controls='collapse${index}'>
            <span class='button-span-parent'>
              <span>${tiePreFix}${playerRank + adjustedPlayerRank}. ${player.name.toUpperCase()}</span>
              <span class="rank-notes">(${
                String(player.getAverageGuessByWeek(currentWeek)).includes(".")
                  ? player.getAverageGuessByWeek(currentWeek).toFixed(2)
                  : player.getAverageGuessByWeek(currentWeek)
              } guess average over ${player.getGamesPlayedCountByWeek(currentWeek)} game${player.getGamesPlayedCountByWeek(currentWeek) === 1 ? '' : 's'} played)</span>
            </span>
            </button>
            </h2>
            <div id='collapse${index}' class='accordion-collapse collapse show' aria-labelledby='heading${index}'>
                <div class='accordion-body'>
                    <h5>All-Time Statistics</h5>
                    <ul>
                        <li>Guess Average: ${
                          String(player.getGuessAverageAllTime()).includes(".")
                            ? player.getGuessAverageAllTime().toFixed(2)
                            : player.getGuessAverageAllTime()
                        }</li>
                        <li>Win Percentage: ${
                          String(player.getWinPercentageAllTime()).includes(".")
                            ? player.getWinPercentageAllTime().toFixed(2)
                            : player.getWinPercentageAllTime()
                        }%</li>
                        <li>Current Streak: ${player.getCurrentStreak()}</li>
                        <li>Max Streak: ${player.getMaxStreak()}</li>
                    </ul>
                </div>
            </div>
        </div>`;
    })
    .join("");
};
const displayUselessStats = () => {
  const uselessStats = document.getElementById("uselessStats");
  uselessStats.innerHTML = getUseLessStatsHTML();
};
const getUseLessStatsHTML = () => {
  const lastWeek = Math.ceil(data.answers.length / 7) - 1;
  const psychic = getLeadersHTML(
    players
      .sort((a, b) => b.getPsychicCount() - a.getPsychicCount())
      .filter(
        (player, index, arr) =>
          player.getPsychicCount() === arr[0].getPsychicCount()
      )
      .map((player) => [player.name, player.getPsychicCount(), "green squares found with first guesses"]),
    "Psychic"
  );
  const lastWeekWinner = getLeadersHTML(
    players
      .sort(
        (a, b) =>
          a.getAverageGuessByWeek(lastWeek) - b.getAverageGuessByWeek(lastWeek)
      )
      .filter(
        (player, index, arr) =>
          player.getAverageGuessByWeek(lastWeek) ===
          arr[0].getAverageGuessByWeek(lastWeek)
      )
      .filter(
        (player, index, arr) => player.getGamesPlayedCountByWeek(lastWeek) === Math.max(...arr.map(player => player.getGamesPlayedCountByWeek(lastWeek)))
      )
      .map((player) => [player.name, player.getAverageGuessByWeek(lastWeek), `guess average over ${player.getGamesPlayedCountByWeek(lastWeek)} game${player.getGamesPlayedCountByWeek(lastWeek) === 1 ? '' : 's'} played`]),
    "Last Week's Winner",
  );
  const mostMisses = getLeadersHTML(
    players
      .sort((a, b) => b.getSwingsAndMissesCount() - a.getSwingsAndMissesCount())
      .filter(
        (player, index, arr) =>
          player.getSwingsAndMissesCount() === arr[0].getSwingsAndMissesCount()
      )
      .map((player) => [player.name, player.getSwingsAndMissesCount(), "times couldn't catch any letters in a guess"]),
    "Swings and Misses"
  );
  const earlyBird = getLeadersHTML(
    players
      .sort((a, b) => b.getEarlyBirdCount() - a.getEarlyBirdCount())
      .filter(
        (player, index, arr) =>
          player.getEarlyBirdCount() === arr[0].getEarlyBirdCount()
      )
      .map((player) => [player.name, player.getEarlyBirdCount(), "times first to post"]),
    "Early Bird"
  );
  const fashionablyLate = getLeadersHTML(
    players
      .sort((a, b) => b.getFashionablyLateCount() - a.getFashionablyLateCount())
      .filter(
        (player, index, arr) =>
          player.getFashionablyLateCount() === arr[0].getFashionablyLateCount()
      )
      .map((player) => [player.name, player.getFashionablyLateCount(), "times last to post"]),
    "Fashionably Late"
  );
  const lostInTheWoods = getLeadersHTML(
    players
      .sort((a, b) => b.getLostInTheWoodsCount() - a.getLostInTheWoodsCount())
      .filter(
        (player, index, arr) =>
          player.getLostInTheWoodsCount() === arr[0].getLostInTheWoodsCount()
      )
      .map((player) => [player.name, player.getLostInTheWoodsCount(), "guesses before finding first green squares"]),
    "Lost In The Woods"
  );
  const likeASurgeon = getLeadersHTML(
    players
      .sort((a, b) => b.getSurgeonCount() - a.getSurgeonCount())
      .filter(
        (player, index, arr) =>
          player.getSurgeonCount() === arr[0].getSurgeonCount()
      )
      .map((player) => [player.name, player.getSurgeonCount(), "wins without any yellow squares"]),
    "Like A Surgeon"
  );

  return [
    psychic,
    lastWeekWinner,
    mostMisses,
    earlyBird,
    fashionablyLate,
    lostInTheWoods,
    likeASurgeon,
  ].join("");
};
const getLeadersHTML = (sortedAndFilteredArr, header) => {
  return `<div>
            <h5>${header}</h5>
            ${sortedAndFilteredArr
              .map(
                ([name, value, subHeader]) => 
                  `<p>${name.toUpperCase()} - ${
                    String(value).includes(".") ? value.toFixed(2) : value
                  } ${subHeader}</p>`
              )
              .join("")}
          </div>`;
};
const lastUpdateUpdated = () => {
  const recentGame = data.answers[data.answers.length - 1];
  const lastUpdatedDate = new Date(recentGame.date).toDateString();
  const lastUpdatedParagraph = document.getElementById("lastUpdated");
  lastUpdatedParagraph.innerText = `Last Update: ${lastUpdatedDate} (Wordle ${recentGame.id})`;
};

// MARK: FETCH DATA
const fetchJSONData = async (targetJSONFilename) => {
  try {
    const response = await fetch(`./${targetJSONFilename}.json`);
    const parseRes = await response.json();
    if (parseRes) {
      return parseRes;
    }
  } catch (error) {
    console.log(error);
  }
};
fetchJSONData("somaek")
  .then((res) => {
    data = res;
  })
  .then(loadPlayers)
  .then(displayPlayers)
  .then(displayUselessStats)
  .then(lastUpdateUpdated)
  .catch((error) => console.log(error));
