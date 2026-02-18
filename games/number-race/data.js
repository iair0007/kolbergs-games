/**
 * Number Race - Data & Math Problem Generator
 */

// Difficulty configurations
const DIFFICULTY_CONFIG = {
    easy: {
        questionsCount: 10,
        opponentSpeed: 0.6,
        addition: { min: 1, max: 10 },
        subtraction: { min: 1, max: 10 },
        multiplication: null,
        division: null
    },
    medium: {
        questionsCount: 15,
        opponentSpeed: 0.8,
        addition: { min: 1, max: 20 },
        subtraction: { min: 1, max: 20 },
        multiplication: { min: 1, max: 5 },
        division: null
    },
    hard: {
        questionsCount: 20,
        opponentSpeed: 1.0,
        addition: { min: 1, max: 100 },
        subtraction: { min: 1, max: 100 },
        multiplication: { min: 1, max: 10 },
        division: { min: 1, max: 10 }
    }
};

// Character image paths
const CHARACTER_IMAGES = {
    batman: '../../platform/images/characters/yuval_batman.png',
    flash: '../../platform/images/characters/yuval_flash.png',
    superman: '../../platform/images/characters/Or_superman.png',
    captain: '../../platform/images/characters/papa_capitan.png'
};

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle an array
 */
function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Generate addition problem
 */
function generateAddition(config) {
    const a = randomInt(config.min, config.max);
    const b = randomInt(config.min, config.max);
    const answer = a + b;
    return {
        question: `${a} + ${b} = ?`,
        answer: answer
    };
}

/**
 * Generate subtraction problem
 */
function generateSubtraction(config) {
    const a = randomInt(config.min, config.max);
    const b = randomInt(1, a); // Ensure positive result
    const answer = a - b;
    return {
        question: `${a} - ${b} = ?`,
        answer: answer
    };
}

/**
 * Generate multiplication problem
 */
function generateMultiplication(config) {
    const a = randomInt(config.min, config.max);
    const b = randomInt(config.min, config.max);
    const answer = a * b;
    return {
        question: `${a} × ${b} = ?`,
        answer: answer
    };
}

/**
 * Generate division problem (only whole numbers)
 */
function generateDivision(config) {
    const b = randomInt(config.min, config.max);
    const quotient = randomInt(config.min, config.max);
    const a = b * quotient;
    const answer = quotient;
    return {
        question: `${a} ÷ ${b} = ?`,
        answer: answer
    };
}

/**
 * Generate wrong answers that are close to the correct answer
 */
function generateOptions(correctAnswer) {
    const options = [correctAnswer];
    const usedNumbers = new Set([correctAnswer]);

    while (options.length < 4) {
        // Generate numbers close to the correct answer
        const offset = randomInt(-5, 5);
        const wrongAnswer = correctAnswer + offset;

        // Ensure positive, unique, and different from correct answer
        if (wrongAnswer > 0 && !usedNumbers.has(wrongAnswer)) {
            options.push(wrongAnswer);
            usedNumbers.add(wrongAnswer);
        }
    }

    return shuffle(options);
}

/**
 * Generate a math problem based on difficulty and operation type
 */
function generateProblem(difficulty, operation) {
    const config = DIFFICULTY_CONFIG[difficulty];
    let problem;

    // Determine which operation to use
    let selectedOperation = operation;
    if (operation === 'mixed') {
        const availableOps = [];
        if (config.addition) availableOps.push('addition');
        if (config.subtraction) availableOps.push('subtraction');
        if (config.multiplication) availableOps.push('multiplication');
        if (config.division) availableOps.push('division');
        selectedOperation = availableOps[randomInt(0, availableOps.length - 1)];
    }

    // Generate problem based on operation
    switch (selectedOperation) {
        case 'addition':
            problem = generateAddition(config.addition);
            break;
        case 'subtraction':
            problem = generateSubtraction(config.subtraction);
            break;
        case 'multiplication':
            if (config.multiplication) {
                problem = generateMultiplication(config.multiplication);
            } else {
                // Fallback to addition if multiplication not available
                problem = generateAddition(config.addition);
            }
            break;
        case 'division':
            if (config.division) {
                problem = generateDivision(config.division);
            } else {
                // Fallback to addition if division not available
                problem = generateAddition(config.addition);
            }
            break;
        default:
            problem = generateAddition(config.addition);
    }

    // Generate answer options
    const options = generateOptions(problem.answer);

    return {
        question: problem.question,
        correctAnswer: problem.answer,
        options: options
    };
}

/**
 * Get difficulty configuration
 */
function getDifficultyConfig(difficulty) {
    return DIFFICULTY_CONFIG[difficulty];
}

/**
 * Get character image path
 */
function getCharacterImage(character) {
    return CHARACTER_IMAGES[character] || CHARACTER_IMAGES.batman;
}
