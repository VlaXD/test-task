export const getPaginationParameters = (limit = '50', page = '0') => {
	const limitValue =
		Number.isNaN(parseInt(limit, 10)) ||
			parseInt(limit, 10) < 0 ||
			parseInt(limit, 10) > 100
			? 50
			: Number(limit);
	const pageValue = Number.isNaN(parseInt(page, 10)) ? 0 : Number(page);
	return { limit: limitValue, skip: limitValue * pageValue };
};
