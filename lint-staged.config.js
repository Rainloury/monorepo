module.exports=  {
    '**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}': [
        'prettier --no-error-on-unmatched-pattern --write',
        'eslint --no-warn-ignored --no-error-on-unmatched-pattern --fix'
    ],
    '**/*.{css,less,scss,style}': [
        'prettier --no-error-on-unmatched-pattern --write',
        'stylelint --fix --allow-empty-input'
    ],
    '**/*.{html,vue}': [
        'prettier --no-error-on-unmatched-pattern --write',
        'stylelint --fix --allow-empty-input',
        'eslint --no-warn-ignored --no-error-on-unmatched-pattern --fix'
    ],
    '**/*.json': ['prettier --no-error-on-unmatched-pattern --write']
}
