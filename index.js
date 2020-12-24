#!/usr/bin/env node

const fs = require('fs')
const program = require('commander')
const chalk = require('chalk')
const download = require('download-git-repo')
const inquirer = require('inquirer')
const ora = require('ora')
const symbols = require('log-symbols')
const handlebars = require('handlebars')

program
  .version(require('./package').version, '-v, --version')
  .command('init <projectName>')
  .action((projectName) => {
    if (!fs.existsSync(projectName)) {
      inquirer.prompt([
        {
          name: 'cliType',
          message: 'which cli type would you want to create?',
          type: 'list',
          choices: ['xc-pro'],
        },
        {
          name: 'description',
          message: 'please enter a description:',
        },
        {
          name: 'author',
          message: 'please enter a author:',
        }
      ]).then((answers) => {
        console.log('answers', answers)
        // start to download
        
        const spinner = ora('downloading template...')
        const downloadUrl = `direct:https://github.com/xiaoYweb/${answers.cliType}.git#master`;
        console.log('downloadUrl ---> ', downloadUrl)
        
        spinner.start()

        download(downloadUrl, projectName, { clone: true }, err => {
            if (err) {
              spinner.fail()

              console.error(
                symbols.error, 
                chalk.red(`${err} download template fail,please check your network connection and try again`)
              )
              process.exit(1)
              // return 
            }
            
            spinner.succeed()

            const meta = {
              name: projectName,
              description: answers.description,
              author: answers.author,
            }

            const packageFilePath = `${projectName}/package.json`;
            const content = fs.readFileSync(packageFilePath).toString()
            const result = handlebars.compile(content)(meta) // 替换 内容 
            fs.writeFileSync(packageFilePath, result)
          })
      })
      return 
    } 

    // 错误提示项目已存在，避免覆盖原有项目
    console.error(symbols.error, chalk.red('project had exist'))

  }).on('--help', () => {
    console.log('  Examples:')
    console.log('    $ w init index')
    console.log()
  })

program.parse(process.argv)