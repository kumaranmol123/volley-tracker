// Game state variables
let gameState = {
  teamA: { name: "", score: 0, stats: { Spike: 0, Block: 0, Serve: 0, Attack: 0 } },
  teamB: { name: "", score: 0, stats: { Spike: 0, Block: 0, Serve: 0, Attack: 0 } },
  gameLog: [],
  gameStartTime: null,
  targetScore: 25,
  gameActive: false,
}

let gameTimer = null
const lucide = {} // Declare the lucide variable

// Initialize Lucide icons
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons()
  updateInfoCards()
})

// Start the game
function startGame() {
  const teamAName = document.getElementById("teamAName").value.trim() || "Team A"
  const teamBName = document.getElementById("teamBName").value.trim() || "Team B"

  gameState.teamA.name = teamAName
  gameState.teamB.name = teamBName
  gameState.gameStartTime = new Date()
  gameState.gameActive = true

  // Update display
  document.getElementById("teamADisplay").textContent = teamAName
  document.getElementById("teamBDisplay").textContent = teamBName
  document.getElementById("teamAStatsName").textContent = teamAName
  document.getElementById("teamBStatsName").textContent = teamBName

  // Show game sections
  document.getElementById("setupSection").classList.add("hidden")
  document.getElementById("gameSection").classList.remove("hidden")

  // Add game start log
  addToLog("Game Started", `${teamAName} vs ${teamBName}`, "start")

  // Start game duration timer
  startGameTimer()

  // Update info cards
  updateInfoCards()
}

// Add point to team
function addPoint(team, action) {
  if (!gameState.gameActive) return

  const teamKey = `team${team}`
  gameState[teamKey].score++
  gameState[teamKey].stats[action]++

  // Update score display
  document.getElementById(`team${team}Score`).textContent = gameState[teamKey].score

  // Update stats display
  document.getElementById(`team${team}${action}`).textContent = gameState[teamKey].stats[action]

  // Add to log
  addToLog(action, gameState[teamKey].name, "point")

  // Update current score display
  updateCurrentScore()

  // Update info cards
  updateInfoCards()

  // Check for winner
  if (gameState[teamKey].score >= gameState.targetScore) {
    endGame(team)
  }
}

// Add action to log
function addToLog(action, team, type) {
  const timestamp = new Date().toLocaleTimeString()
  const logEntry = {
    action,
    team,
    type,
    timestamp,
    scoreA: gameState.teamA.score,
    scoreB: gameState.teamB.score,
  }

  gameState.gameLog.unshift(logEntry)

  // Update log display
  updateLogDisplay()
}

// Update log display
function updateLogDisplay() {
  const logContainer = document.getElementById("actionLog")

  if (gameState.gameLog.length === 0) {
    logContainer.innerHTML = '<p class="no-actions">Game actions will appear here...</p>'
    return
  }

  logContainer.innerHTML = gameState.gameLog
    .map((entry) => {
      return `
            <div class="log-item">
                <div class="log-action">
                    <span class="log-team">${entry.team}</span>
                    <span>${entry.action}</span>
                </div>
                <div class="log-time">${entry.timestamp}</div>
            </div>
        `
    })
    .join("")
}

// Update current score display
function updateCurrentScore() {
  document.getElementById("currentScore").textContent = `${gameState.teamA.score} - ${gameState.teamB.score}`
}

// Update info cards
function updateInfoCards() {
  // Total points
  const totalPoints = gameState.teamA.score + gameState.teamB.score
  document.getElementById("totalPoints").textContent = `${totalPoints} points scored`

  // Leading team
  let leadingTeam = "Tied"
  if (gameState.teamA.score > gameState.teamB.score) {
    leadingTeam = gameState.teamA.name
  } else if (gameState.teamB.score > gameState.teamA.score) {
    leadingTeam = gameState.teamB.name
  }
  document.getElementById("leadingTeam").textContent = leadingTeam
}

// Start game timer
function startGameTimer() {
  if (gameTimer) {
    clearInterval(gameTimer)
  }

  gameTimer = setInterval(() => {
    if (gameState.gameStartTime && gameState.gameActive) {
      const now = new Date()
      const duration = Math.floor((now - gameState.gameStartTime) / 60000)
      document.getElementById("gameDuration").textContent = `${duration} minutes`
    }
  }, 1000)
}

// End game
function endGame(winningTeam) {
  gameState.gameActive = false
  const winner = gameState[`team${winningTeam}`]
  const loser = gameState[`team${winningTeam === "A" ? "B" : "A"}`]

  // Stop timer
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }

  // Add to log
  addToLog("Game Won", winner.name, "end")

  // Show winner section
  document.getElementById("winnerText").textContent = `${winner.name} Wins!`
  document.getElementById("finalScoreText").textContent =
    `Final Score: ${winner.name} ${winner.score} - ${loser.score} ${loser.name}`

  document.getElementById("winnerSection").classList.remove("hidden")
}

// Reset current game
function resetGame() {
  if (confirm("Are you sure you want to reset the current game?")) {
    gameState.teamA.score = 0
    gameState.teamB.score = 0
    gameState.teamA.stats = { Spike: 0, Block: 0, Serve: 0, Attack: 0 }
    gameState.teamB.stats = { Spike: 0, Block: 0, Serve: 0, Attack: 0 }
    gameState.gameLog = []
    gameState.gameActive = true
    gameState.gameStartTime = new Date()

    // Update displays
    document.getElementById("teamAScore").textContent = "0"
    document.getElementById("teamBScore").textContent = "0"
    updateCurrentScore()
    updateStatsDisplay()
    updateLogDisplay()
    updateInfoCards()

    // Hide winner section
    document.getElementById("winnerSection").classList.add("hidden")

    // Restart timer
    startGameTimer()

    // Add reset log
    addToLog("Game Reset", "System", "start")
  }
}

// Undo last action
function undoLastAction() {
  if (gameState.gameLog.length === 0 || !gameState.gameActive) return

  const lastAction = gameState.gameLog[0]
  if (lastAction.type === "point") {
    // Find which team scored
    const team = lastAction.team === gameState.teamA.name ? "teamA" : "teamB"
    const teamLetter = team === "teamA" ? "A" : "B"

    // Reduce score and stats
    gameState[team].score = Math.max(0, gameState[team].score - 1)
    gameState[team].stats[lastAction.action] = Math.max(0, gameState[team].stats[lastAction.action] - 1)

    // Update displays
    document.getElementById(`team${teamLetter}Score`).textContent = gameState[team].score
    document.getElementById(`team${teamLetter}${lastAction.action}`).textContent =
      gameState[team].stats[lastAction.action]
    updateCurrentScore()
    updateInfoCards()

    // Remove from log
    gameState.gameLog.shift()
    updateLogDisplay()

    // Add undo log
    addToLog("Action Undone", "System", "start")
  }
}

// Start new game
function newGame() {
  // Stop timer
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }

  // Reset all game state
  gameState = {
    teamA: { name: "", score: 0, stats: { Spike: 0, Block: 0, Serve: 0, Attack: 0 } },
    teamB: { name: "", score: 0, stats: { Spike: 0, Block: 0, Serve: 0, Attack: 0 } },
    gameLog: [],
    gameStartTime: null,
    targetScore: 25,
    gameActive: false,
  }

  // Hide all sections except setup
  document.getElementById("setupSection").classList.remove("hidden")
  document.getElementById("gameSection").classList.add("hidden")
  document.getElementById("winnerSection").classList.add("hidden")

  // Reset form values
  document.getElementById("teamAName").value = "Team Alpha"
  document.getElementById("teamBName").value = "Team Beta"
}

// Update stats display
function updateStatsDisplay() {
  ;["A", "B"].forEach((team) => {
    ;["Spike", "Block", "Serve", "Attack"].forEach((action) => {
      document.getElementById(`team${team}${action}`).textContent = gameState[`team${team}`].stats[action]
    })
  })
}

// Add keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (!gameState.gameActive) return

  switch (e.key) {
    case "1":
      addPoint("A", "Spike")
      break
    case "2":
      addPoint("A", "Block")
      break
    case "3":
      addPoint("A", "Serve")
      break
    case "4":
      addPoint("A", "Attack")
      break
    case "7":
      addPoint("B", "Spike")
      break
    case "8":
      addPoint("B", "Block")
      break
    case "9":
      addPoint("B", "Serve")
      break
    case "0":
      addPoint("B", "Attack")
      break
    case "r":
      if (e.ctrlKey) {
        e.preventDefault()
        resetGame()
      }
      break
    case "z":
      if (e.ctrlKey) {
        e.preventDefault()
        undoLastAction()
      }
      break
  }
})
