import React, { useState, useReducer } from 'react';

let user = localStorage.getItem('currentUser')
	? JSON.parse(localStorage.getItem('currentUser'))
	: '';

export const initialState = {
	user: '' || user,
	loading: false,
	errorMessage: null,
	isStoreExpireAlertShown: false
};

export const AuthReducer = (initialState, action) => {
	switch (action.type) {
		case 'REQUEST_LOGIN':
			return {
				...initialState,
				loading: true,
			};
		case 'LOGIN_SUCCESS':
			localStorage.setItem('currentUser', JSON.stringify(action.payload));
			return {
				...initialState,
				user: action.payload,
				loading: false,
			};
		case 'UPDATE_USER':
			localStorage.setItem('currentUser', JSON.stringify(action.payload));
			return {
				...initialState,
				user: action.payload,
				loading: false,
			};
		case 'LOGOUT':
			localStorage.removeItem('currentUser');
			localStorage.removeItem('location');
			return {
				...initialState,
				user: '',
				token: '',
			};

		case 'LOGIN_ERROR':
			return {
				...initialState,
				loading: false,
				errorMessage: action.error,
			};
		case 'STORE_EXP_ALERT':
			return {
				...initialState,
				isStoreExpireAlertShown: true
			};

		default:
			throw new Error(`Unhandled action type: ${action.type}`);
	}
};
