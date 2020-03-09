import debugModule from 'debug'

export const log = debugModule('oaf')
export const warn = debugModule('oaf:WARN')
export const err = debugModule('oaf:ERROR')
