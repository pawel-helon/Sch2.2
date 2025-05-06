import { Session } from "src/types/sessions"
import { Mobile } from "./Mobile"
import { Desktop } from "./Deskop"

export const RescheduleSessionModal = (props: {
  session: Session,
  isMobile: boolean
}) => {
  if (props.isMobile) {
    return <Mobile session={props.session} />
  } else {
    return <Desktop session={props.session} />
  }
}