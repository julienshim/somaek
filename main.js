class Player {
  constructor(name, results, answers) {
    this.name = name;
    this.answers = answers;
    this.hasPlayed = results.length > 0;
    this.results = this.getTrueResults(this.getExpandedObjectResults(results));
  }
  getEarlyBirdCount() {
    return this.results
      .map((result) => result.postOrder)
      .filter((postOrder) => postOrder === "1").length;
  }
  getFashionablyLateCount() {
    return this.results
      .map((result) => result.postOrder)
      .filter((postOrder) => postOrder === "5").length;
  }
  getExpandedObjectResults(results) {
    if (results.length) {
      return results.map(result => {
        const {results, postOrder} = result;
        const resultsArr = results.split(' ');
        const expandedResults  = {
          id: resultsArr[1],
          score: resultsArr[2].split('/')[0],
          attempts: resultsArr.slice(3).join(' ')
        };
        return ({...expandedResults, postOrder});
      })
    }
    return [];
  }
  getTrueResults(results) {
    const resultsIds = results.map((result) => result.id);
    const missingResults = this.answers
      .map((answer) => answer.id)
      .filter((id) => !resultsIds.includes(id));
    const trueResults = [
      ...results,
      missingResults.map((result) => ({
        id: result,
        score: "X",
        attempts: null,
      })),
    ].sort((a, b) => +a.id - +b.id);
    return missingResults.length ? trueResults : results;
  }
  getGuessDistribution() {
    return this.results.reduce(
      (a, b) => {
        if (b.score in a) {
          a[b.score]++;
        } else {
          a[b.score] = 1;
        }
        return a;
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, x: 0 }
    );
  }
  getAverageGuessAllTime() {
    const totalGuesses = this.results
      .map((result) => (result.score === "X" ? 7 : +result.score))
      .reduce((acc, cur) => acc + cur, 0);
    const totalPlayed = this.results.length;
    return this.hasPlayed ? totalGuesses / totalPlayed : "Has Not Played";
  }
  getAverageGuessByWeek(weekNumber) {
    const start = (weekNumber - 1) * 7;
    const end = start + 7;
    const totalGuesses = this.results
      .slice(start, end)
      .map((result) => (result.score === "X" ? 7 : +result.score))
      .reduce((acc, cur) => acc + cur, 0);
    const totalPlayed = this.results.slice(start, end).length;
    return this.hasPlayed ? totalGuesses / totalPlayed : "Has Not Played";
  }
  getWinPercentage() {
    const totalWins = this.results.filter(
      (result) => result.score !== "X"
    ).length;
    const totalPlayed = this.results.length;
    return (totalWins / totalPlayed) * 100;
  }
  getCurrentStreak() {
    const scoresArrReversed = this.results
      .map((result) => result.score)
      .reverse();
    const indexOfX = scoresArrReversed.indexOf("X");
    return this.hasPlayed
      ? indexOfX === -1
        ? this.results.length
        : indexOfX
      : 0;
  }
  getMaxStreak() {
    let max = 0;
    let currentStreak = 0;
    for (let result of this.results) {
      if (result.score !== "X") {
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
  getNumberOfFirstAttemptGreenBoxes() {
    const test = this.results
      .filter((result) => result.attempts !== null)
      .map((result) => result.attempts.split(" ")[0].split(""));
    const firstAttempGreenBoxesCountArr = this.results
      .filter((result) => result.attempts !== null)
      .map(
        (result) =>
          result.attempts
            .split(" ")[0]
            .split("")
            .filter((box) => box === "\udfe9").length
      );
    return firstAttempGreenBoxesCountArr.reduce((acc, cur) => acc + cur, 0);
  }
  getNumberOfMisses() {
    const missesArr = this.results
      .filter((result) => result.attempts !== null)
      .map((result) =>
        result.attempts.split(" ").filter((block) => block === "⬛⬛⬛⬛⬛")
      )
      .filter((block) => block.length);
    return missesArr.length;
  }
}

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
  const rankNumbers = players.map(player => player.getAverageGuessByWeek(currentWeek)).sort((a, b) => a-b);
  weekNumber.innerText = currentWeek;

  return players
    .sort(
      (a, b) =>
        a.getAverageGuessByWeek(currentWeek) -
        b.getAverageGuessByWeek(currentWeek)
    )
    .map((player, index) => {
      const playerRank = rankNumbers.indexOf(player.getAverageGuessByWeek(currentWeek)) + 1;
      const tiePreFix = rankNumbers.filter(rank => rank === player.getAverageGuessByWeek(currentWeek)).length > 1 ? 'T' : '';
      return `<div class="accordion-item">
            <h2 class="accordion-header" id="heading${index}">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="true" aria-controls="collapse${index}">
            ${tiePreFix}${playerRank}. ${player.name.toUpperCase()} (${String(player.getAverageGuessByWeek(
        currentWeek
      )).includes('.') ? player.getAverageGuessByWeek(
        currentWeek
      ).toFixed(2) : player.getAverageGuessByWeek(
        currentWeek
      )})
            </button>
            </h2>
            <div id="collapse${index}" class="accordion-collapse collapse show" aria-labelledby="heading${index}">
                <div class="accordion-body">
                    <h5>All-Time Statistics</h5>
                    <ul>
                        <li>Guess Average: ${String(player.getAverageGuessAllTime()).includes('.') ? player.getAverageGuessAllTime().toFixed(2) : player.getAverageGuessAllTime()}</li>
                        <li>Win Percentage: ${String(player.getWinPercentage()).includes('.') ? player.getWinPercentage().toFixed(2): player.getWinPercentage()}%</li>
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
  const psychic = getLeadersHTML(players
    .sort((a, b) => b.getNumberOfFirstAttemptGreenBoxes() - a.getNumberOfFirstAttemptGreenBoxes())
    .filter((player, index, arr) => player.getNumberOfFirstAttemptGreenBoxes() === arr[0].getNumberOfFirstAttemptGreenBoxes())
    .map(player => [player.name, player.getNumberOfFirstAttemptGreenBoxes()]),
    "Psychic",
    "green squares found with first guesses");
  const lastWeekWinner = getLeadersHTML(players
    .sort((a, b) => a.getAverageGuessByWeek(lastWeek) - b.getAverageGuessByWeek(lastWeek))
    .filter((player, index, arr) => player.getAverageGuessByWeek(lastWeek) === arr[0].getAverageGuessByWeek(lastWeek))
    .map(player => [player.name, player.getAverageGuessByWeek(lastWeek)]),
    "Last Week's Winner",
    "guess average");
  const mostMisses = getLeadersHTML(players
    .sort((a, b) => b.getNumberOfMisses() - a.getNumberOfMisses())
    .filter((player, index, arr) => player.getNumberOfMisses() === arr[0].getNumberOfMisses())
    .map(player => [player.name, player.getNumberOfMisses()]),
    "Most Misses",
    "times couldn't catch any letters in a guess");
  const earlyBird = getLeadersHTML(players
    .sort((a, b) => b.getEarlyBirdCount() - a.getEarlyBirdCount())
    .filter((player, index, arr) => player.getEarlyBirdCount() === arr[0].getEarlyBirdCount())
    .map(player => [player.name, player.getEarlyBirdCount()]),
    "Early Bird",
    "times first to post");
  const fashionablyLate = getLeadersHTML(players
    .sort((a, b) => b.getFashionablyLateCount() - a.getFashionablyLateCount())
    .filter((player, index, arr) => player.getFashionablyLateCount() === arr[0].getFashionablyLateCount())
    .map(player => [player.name, player.getFashionablyLateCount()]),
    "Fashionably Late",
    "times last to post");

  return [psychic, lastWeekWinner, mostMisses, earlyBird, fashionablyLate].join("");
};

const getLeadersHTML = (sortedAndFilteredArr, header, subHeader) => {
  return `<div>
            <h5>${header}</h5>
            ${sortedAndFilteredArr.map(([name, value]) => `<p>${name.toUpperCase()} - ${String(value).includes('.') ? value.toFixed(2) : value} ${subHeader}</p>`).join("")}
          </div>`;
}

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

const lastUpdateUpdated = () => {
  const recentGame = data.answers[data.answers.length - 1];
  const lastUpdatedDate = new Date(recentGame.date).toDateString();
  const lastUpdatedParagraph = document.getElementById('lastUpdated');
  lastUpdatedParagraph.innerText = `Last Update: ${lastUpdatedDate} (Wordle ${recentGame.id})`;
}

fetchJSONData("somaek")
  .then((res) => {
    data = res;
  })
  .then(loadPlayers)
  .then(displayPlayers)
  .then(displayUselessStats)
  .then(lastUpdateUpdated)
  .catch((error) => console.log(error));