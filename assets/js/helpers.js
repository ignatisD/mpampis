if(typeof module === 'object'){
    window.module = module;
    module = undefined;
}

const { exec, spawn } = require('child_process');
const { shell } = require('electron');
const { dialog } = require('electron').remote;
const fs = require('fs');
const path = require('path');

var defaultEnv = {
    directory: ""
};
