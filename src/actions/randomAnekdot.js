import { JsonResponse } from '../utils/index.js'
import { InteractionResponseType } from 'discord-interactions'
class ElementHandler {
  element(element) {
    console.log('ElementHandler, element: ', element)
    const textContent = element.textContent
    if (textContent) {
      console.log('textContent: ', textContent)
      // const translation = this.countryStrings[i18nKey];
      // if (translation) {
      //   element.setInnerContent(translation);
      // }
    }
  }
}

const getAnekdots = async () => {
  return 'privet'
}
export const randomAnekdot = async (interaction, env) => {
  const text = await getAnekdots()

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: text
    }
  })
}
