import { Base } from '../../entities/Base'
import { salonIndexResponse } from '../../request-response-types/Dashboard'
import { LocationResponse } from '../../request-response-types/Location'

export type ReshubResponse =
Base |
salonIndexResponse |
LocationResponse
