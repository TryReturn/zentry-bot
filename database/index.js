const mongoose = require('mongoose');
const chalk = require('chalk');

const mongoConfig = {
  IP_ADDRESS: process.env.MONGO_HOST || 'localhost',
  PORT: process.env.MONGO_PORT || '27017',
  USER: process.env.MONGO_USER || '',
  PASSWORD: process.env.MONGO_PASSWORD || '',
  DATABASE: process.env.MONGO_DB || 'myapp',
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000,
  CONNECTION_TIMEOUT: 30000,
  SOCKET_TIMEOUT: 45000
};

let isConnected = false;
let retryCount = 0;

function getConnectionString() {
  const { USER, PASSWORD, IP_ADDRESS, PORT, DATABASE } = mongoConfig;
  
  if (USER && PASSWORD) {
    return `mongodb://${USER}:${encodeURIComponent(PASSWORD)}@${IP_ADDRESS}:${PORT}/${DATABASE}?authSource=admin`;
  } else {
    return `mongodb://${IP_ADDRESS}:${PORT}/${DATABASE}`;
  }
}

function getConnectionOptions() {
  return {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: mongoConfig.CONNECTION_TIMEOUT,
    socketTimeoutMS: mongoConfig.SOCKET_TIMEOUT,
    maxPoolSize: 10,
    retryWrites: true
  };
}

function setupEventHandlers() {
  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.log(chalk.yellow(chalk.bold('DATABASE')), chalk.white('>>'), chalk.yellow('Disconnected from MongoDB'));
  });

  mongoose.connection.on('error', (error) => {
    console.error(chalk.red(chalk.bold('DATABASE')), chalk.white('>>'), chalk.red('Connection error:'), error.message);
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    console.log(chalk.green(chalk.bold('DATABASE')), chalk.white('>>'), chalk.green('Reconnected to MongoDB'));
  });

  process.on('SIGINT', async () => {
    await closeConnection();
    process.exit(0);
  });
}

async function closeConnection() {
  if (isConnected) {
    try {
      await mongoose.connection.close();
      console.log(chalk.blue(chalk.bold('DATABASE')), chalk.white('>>'), chalk.blue('Connection closed gracefully'));
    } catch (error) {
      console.error(chalk.red(chalk.bold('DATABASE')), chalk.white('>>'), chalk.red('Error closing connection:'), error.message);
    }
  }
}

async function connectToDatabase() {
  if (isConnected) {
    console.log(chalk.blue(chalk.bold('DATABASE')), chalk.white('>>'), chalk.blue('Already connected to MongoDB'));
    return;
  }

  try {
    const connectionString = getConnectionString();
    const options = getConnectionOptions();

    console.log(chalk.yellow(chalk.bold('DATABASE')), chalk.white('>>'), chalk.yellow('Connecting to MongoDB...'));
    
    await mongoose.connect(connectionString, options);
    
    isConnected = true;
    retryCount = 0;
    
    console.log(chalk.green(chalk.bold('DATABASE')), chalk.white('>>'), chalk.green('✓ Successfully connected to MongoDB'));
    
    setupEventHandlers();
    
  } catch (error) {
    await handleConnectionError(error);
  }
}

async function handleConnectionError(error) {
  retryCount++;
  
  console.error(chalk.red(chalk.bold('DATABASE')), chalk.white('>>'), chalk.red('✗ Connection failed'));
  console.error(chalk.red('[ERROR DETAILS] >>'), error.message);
  
  if (retryCount <= mongoConfig.MAX_RETRIES) {
    console.log(chalk.yellow(`[RETRY] >> Attempt ${retryCount}/${mongoConfig.MAX_RETRIES} in ${mongoConfig.RETRY_DELAY/1000}s`));
    
    setTimeout(() => connectToDatabase(), mongoConfig.RETRY_DELAY);
  } else {
    console.error(chalk.red('[FATAL ERROR] >> Max retries reached. Please check:'));
    console.error(chalk.red('  • MongoDB server status'));
    console.error(chalk.red('  • Connection credentials'));
    console.error(chalk.red('  • Network connectivity'));
    console.error(chalk.red('  • Firewall settings'));
    console.log("[SOPORTE] >> Support https://discord.gg/da7zM3DNTW");
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

function getConnectionStatus() {
  return {
    isConnected: isConnected,
    retryCount: retryCount,
    readyState: mongoose.connection.readyState,
    states: {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }
  };
}

connectToDatabase();

module.exports = {
  connectToDatabase,
  closeConnection,
  getConnectionStatus,
  mongoose
};