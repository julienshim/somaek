class Player {
  constructor(name, results, answers) {
    this.name = name;
    this.answers = answers;
    this.hasPlayed = results.length > 0;
    this.results = this.getTrueResults(results);
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
    const totalGuesses = this.results
      .slice((weekNumber - 1) * 7)
      .map((result) => (result.score === "X" ? 7 : +result.score))
      .reduce((acc, cur) => acc + cur, 0);
    const totalPlayed = this.results.slice((weekNumber - 1) * 7).length;
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
    console.log(this.results);
    console.log(test);
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
  weekNumber.innerText = currentWeek;

  return players
    .sort(
      (a, b) =>
        a.getAverageGuessByWeek(currentWeek) -
        b.getAverageGuessByWeek(currentWeek)
    )
    .map((player, index) => {
      return `<div class="accordion-item">
            <h2 class="accordion-header" id="heading${index}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
            ${player.name.toUpperCase()} - ${player.getAverageGuessByWeek(
        currentWeek
      )}
            </button>
            </h2>
            <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}">
                <div class="accordion-body">
                    <h5>All-Time Statistics</h5>
                    <ul>
                        <li>Guess Average: ${player.getAverageGuessAllTime()}</li>
                        <li>Win Percentage: ${player.getWinPercentage()}%</li>
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
    "Psychic");
  const lastWeekWinner = getLeadersHTML(players
    .sort((a, b) => a.getAverageGuessByWeek(lastWeek) - b.getAverageGuessByWeek(lastWeek))
    .filter((player, index, arr) => player.getAverageGuessByWeek() === arr[0].getAverageGuessByWeek())
    .map(player => [player.name, player.getAverageGuessByWeek()]),
    "Last Week's Winner");
  const mostMisses = getLeadersHTML(players
    .sort((a, b) => b.getNumberOfMisses() - a.getNumberOfMisses())
    .filter((player, index, arr) => player.getNumberOfMisses() === arr[0].getNumberOfMisses())
    .map(player => [player.name, player.getNumberOfMisses()]),
    "Most Misses");
  const earlyBird = getLeadersHTML(players
    .sort((a, b) => b.getEarlyBirdCount() - a.getEarlyBirdCount())
    .filter((player, index, arr) => player.getEarlyBirdCount() === arr[0].getEarlyBirdCount())
    .map(player => [player.name, player.getEarlyBirdCount()]),
    "Early Bird");
  const fashionablyLate = getLeadersHTML(players
    .sort((a, b) => b.getFashionablyLateCount() - a.getFashionablyLateCount())
    .filter((player, index, arr) => player.getFashionablyLateCount() === arr[0].getFashionablyLateCount())
    .map(player => [player.name, player.getFashionablyLateCount()]),
    "Fashionably Late");

  return [psychic, lastWeekWinner, mostMisses, earlyBird, fashionablyLate].join("");
};

const getLeadersHTML = (sortedAndFilteredArr, header) => {
  console.log(sortedAndFilteredArr)
  return `<div>
            <h5>${header}</h5>
            ${sortedAndFilteredArr.map(([name, value]) => `<p>${name.toUpperCase()} - ${String(value).includes('.') ? value.toFixed(2) : value}</p>`).join("")}
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

fetchJSONData("somaek")
  .then((res) => {
    data = res;
  })
  .then(loadPlayers)
  .then(displayPlayers)
  .then(displayUselessStats)
  .catch((error) => console.log(error));
