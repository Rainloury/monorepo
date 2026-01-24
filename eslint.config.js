import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import vueEslintParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import importSort from 'eslint-plugin-simple-import-sort'

export default [
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                computed: 'readonly',
                defineEmits: 'readonly',
                defineExpose: 'readonly',
                defineProps: 'readonly',
                onMounted: 'readonly',
                onUnmounted: 'readonly',
                reactive: 'readonly',
                ref: 'readonly',
                shallowReactive: 'readonly',
                shallowRef: 'readonly',
                toRef: 'readonly',
                toRefs: 'readonly',
                watch: 'readonly',
                watchEffect: 'readonly'
            }
        },
        name: 'xxx/vue/setup',
        plugins: {
            vue: pluginVue
        }
    },
    {
        files: ['**/*.{ts,tsx,vue}'],
        rules: {
            ...js.configs.recommended.rules,
            ...pluginVue.configs['flat/recommended'].rules,
            'no-unused-vars': 'error',
            'no-undef': 'error',
            'no-console': 'error',
            'vue/valid-define-emits': 'error',
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error'
        },
        languageOptions: {
            parser: vueEslintParser,
            parserOptions: {
                extraFileExtensions: ['.vue'],
                ecmaFeatures: {
                    jsx: true
                },
                parser: tsParser,
                sourceType: 'module'
            }
        },
        plugins: { vue: pluginVue, 'simple-import-sort': importSort }
    }
]
