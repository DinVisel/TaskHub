import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import en from "./locales/en.json";
import tr from "./locales/tr.json";

const resources = {
	en: { translation: en },
	tr: { translation: tr },
};

const getLanguage = () => {
	try {
		const locales = Localization.getLocales();
		if (locales && locales.length > 0) {
			return locales[0].languageCode;
		}
	} catch (e) {
		console.log("Error getting locale", e);
	}
	return "en";
};

i18n.use(initReactI18next).init({
	resources,
	lng: getLanguage(),
	fallbackLng: "en",
	interpolation: {
		escapeValue: false,
	},
	react: {
		useSuspense: false,
	},
});

export default i18n;
