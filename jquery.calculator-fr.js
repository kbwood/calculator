/* http://keith-wood.name/calculator.html
   French initialisation for the jQuery calculator extension
   Written by Keith Wood (kbwood{at}iinet.com.au) October 2008. */
(function($) { // hide the namespace

$.calculator.regional['fr'] = {
	decimalChar: ',',
	buttonText: '...', buttonStatus: 'Ouvrir la calculatrice',
	closeText: 'Fermer', closeStatus: 'Fermer la calculatrice',
	useText: 'Utiliser', useStatus: 'Utiliser la valeur actuelle',
	eraseText: 'Effacer', eraseStatus: 'Effacer la valeur',
	backspaceText: 'DF', backspaceStatus: 'Effacer le dernier chiffre',
	clearErrorText: 'CE', clearErrorStatus: 'Effacer le dernier nombre',
	clearText: 'CT', clearStatus: 'Régler la calculatrice',
	memClearText: 'MD', memClearStatus: 'Dégager la mémoire',
	memRecallText: 'MS', memRecallStatus: 'Souvener de la valeur de mémoire',
	memStoreText: 'MC', memStoreStatus: 'Conserver la valeur dans la mémoire',
	memAddText: 'M+', memAddStatus: 'Ajouter à la mémoire',
	memSubtractText: 'M-', memSubtractStatus: 'Soustrayer de mémoire',
	base2Text: 'Bin', base2Status: 'Changement aux nombres binaires',
	base8Text: 'Oct', base8Status: 'Changement aux nombres octal',
	base10Text: 'Déc', base10Status: 'Changement aux nombres décimale',
	base16Text: 'Hex', base16Status: 'Changement aux nombres hexadécimal',
	degreesText: 'Deg', degreesStatus: 'Changement aux degrés',
	radiansText: 'Rad', radiansStatus: 'Changement aux radians',
	isRTL: false
};
$.calculator.setDefaults($.calculator.regional['fr']);

})(jQuery);
