module.exports = {
    apps: [
      {
        name: "option-chain-cluster-1",
        script: "./dist/server.js", // ✅ JavaScript file
        instances: 1,
        exec_mode: "cluster",
        restart_delay: 1000,
        env_production: {
          NODE_ENV: "production",
          ID: 1,
        },
        watch: false,
        ignore_watch: ["node_modules", "Logs", "Expiry", ".git"],
        log_file: "./Logs/cluster-1/combined.log",
        out_file: "./Logs/cluster-1/out.log",
        error_file: "./Logs/cluster-1/error.log",
      },
      {
        name: "option-chain-cluster-2",
        script: "./dist/server.js", // ✅ JavaScript file
        instances: 1,
        exec_mode: "cluster",
        restart_delay: 1000,
        env_production: {
          NODE_ENV: "production",
          ID: 2,
        },
        watch: false,
        ignore_watch: ["node_modules", "Logs", "Expiry", ".git"],
        log_file: "./Logs/cluster-2/combined.log",
        out_file: "./Logs/cluster-2/out.log",
        error_file: "./Logs/cluster-2/error.log",
      },
    ],
  };
  