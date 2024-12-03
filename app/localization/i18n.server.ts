import { resolve } from "node:path"
import { RemixI18Next } from "remix-i18next/server"
import i18n from "~/localization/i18n" // your i18n configuration file

const i18next = new RemixI18Next({
	detection: {
		supportedLanguages: i18n.supportedLngs,
		fallbackLanguage: i18n.fallbackLng,
	},
	// This is the configuration for i18next used
	// when translating messages server-side only
	i18next: {
		...i18n,
		backend: {
			loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json"),
		},
	},
})

export default i18next
