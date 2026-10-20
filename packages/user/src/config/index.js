import { hosts } from './config'

const env = 'dev'

const host = Object.keys(hosts)
  .map(function (key) {
    return {
      [key]: hosts[key][env],
    }
  })
  .reduce((pre, cur) => {
    return {
      ...pre,
      ...cur,
    }
  }, {})

export default host
