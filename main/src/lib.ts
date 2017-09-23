import { Url } from 'url'

export const isTeadsRequestUrl = (url: Url) =>
  /teads\.tv$/.test(url.hostname!)

export const isFormatFrameworkRequestUrl = (url: Url) =>
  isTeadsRequestUrl(url) &&
  /format\/v3\/teads-format(\.min)?\.js(\.map)?$/.test(
    url.path!
  )

export const isDailyBugleRequest = (url: Url) =>
  /dailybugle\.com$/.test(url.hostname!)

export const isTagRequestUrl = (url: Url) =>
  isTeadsRequestUrl(url) &&
  /^\/page\/[0-9]+\/tag/.test(url.path!)

export const isAdRequestUrl = (url: Url) =>
  isTeadsRequestUrl(url) &&
  /^\/page\/[0-9]+\/ad/.test(url.path!)

export const getTarget = ({ protocol, host }: Url) =>
  protocol + '//' + host
