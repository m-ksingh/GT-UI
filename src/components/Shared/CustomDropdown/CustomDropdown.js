import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import Dropdown from 'react-bootstrap/Dropdown';
import SelectableContext from "react-bootstrap/SelectableContext";
import classNames from 'classnames';
import "./CustomDropdown.css";
import { IcnAdd } from '../../icons';
import { Form } from 'react-bootstrap'
import { getUniqueId } from '../../../commons/utils';


const ICN_DOWN_SMALL = <svg xmlns="http://www.w3.org/2000/svg" width="8" height="5" viewBox="0 0 9.887 6"><path fill="#000000" className="a" d="M4.957,14.524l-4.4-4.4a.543.543,0,0,1,0-.768l.513-.513a.543.543,0,0,1,.768,0l3.5,3.487,3.5-3.487a.543.543,0,0,1,.768,0l.513.513a.543.543,0,0,1,0,.768l-4.4,4.4A.543.543,0,0,1,4.957,14.524Z" transform="translate(-0.398 -8.683)" /></svg>
const CustomDropdown = ({
	data = [],
	bindKey = null,
	multiKey = [],
	multiKey1 = [],
	multiKey2 = [],
	multipleKeys = [],
	valueKey = null,
	searchKeywords = "",
	onSelect = () => { },
	title = "",
	selectedVal = null,
	visible,
	onClosed = () => { },
	disabled = false,
	in_Valid = false,
	onSearch = () => { },
	onAddList=null,
	icon,
	noRecordMessage= "No records found",
	multiSelect = false,
	selectedValues = [],
	selectedValueKey = "",
}) => {
	const [search, setSearch] = useState();
	const [searchElemId] = useState(Date.now());
	const [selectedItems, setSelectedItems] = useState(selectedValues);
	const [showDropdown, setShowDropdown] = useState(false);
	const dropdownRef = useRef();

	/*
		Stops event propagation when user select an option.
		@param {Event} e - Click event object
	*/
	const preventEventForSearch = (e) => e.stopPropagation();

	/*
		Fired when user selects a dropdown option.
		@param {Event} e - Click event object
		@param {Objects} obj - Dropdown option object
	*/
	const valueSelected = (e, obj) => {
		try {
			onSelect((valueKey) ? obj[valueKey] : obj);
			preventEventForSearch(e);
		} catch (err) {
			console.error("Error occurred while valueSelected -- " + err);
		}
	}

	// Returns filtered data by bind key
	// const filteredData = () => {
	// 	let fData = [];
	// 	try {
	// 		fData = data.filter((arr) => ((arr[bindKey] ? arr[bindKey] : arr).search(new RegExp(escapeRegExString(search), "i")) >= 0));
	// 	} catch (err) {
	// 		fData = [];
	// 	}
	// 	return fData;
	// }
// + (arr?.[multiKey] ?? '')
	// Returns filtered data by Multi key
	const filteredData = () => {
		let fData = [];
		try {
			fData = data.filter((arr) => ((((`${((!_.isEmpty(arr[bindKey]) ? arr[bindKey] + ", " : '') + arr[multiKey]) + ", " + arr[multiKey1] + ", " + arr[multiKey2]}`) ) ?? arr).search(new RegExp(escapeRegExString(search), "i")) >= 0));
		} catch (err) {
			fData = [];
		}
		return fData;
	}

	// Returns selected value by bindKey if it's object
	const getSelectedVal = (val) => !_.isEmpty(val) ? val[bindKey] : val;

	const escapeRegExString = (str) => {
		const matchOperatorsRegex = /[|\\{}()[\]^$+*?.-]/g;
		if (typeof str === 'string')
			return str.replace(matchOperatorsRegex, '\\$&');
		else
			return str;
	}

	// useEffect(() => {
	// 	if (Array.isArray(selectedValues)) {
	// 		try {
	// 			setSelectedItems(selectedValues.map(c => {
	// 				let data = {};
	// 				if (typeof c === 'string') {
	// 					data[selectedValueKey] = c;
	// 				} else {
	// 					data = c;
	// 				}
	// 				return data;
	// 			}))
	// 		} catch (err) {
	// 			console.error("Error occurred while setting selected items: ", err);
	// 		}
	// 	} else {
	// 		setSelectedItems([]);
	// 		setSearch('');
	// 	}
	// }, [selectedValues])


	// Listening a click event of dropdown and set search keyword as empty
	useEffect(() => {
		const setSearchKeywords = () => setSearch("");
		let elem = document.getElementById("cd-toggle");
		elem.addEventListener("click", setSearchKeywords);
		return elem.removeEventListener("click", setSearchKeywords)
	}, [])

	return <SelectableContext.Provider value={false}>
		<Dropdown
			ref={dropdownRef}
			onToggle={(e) => {
				try {
					if (e) {
						window.setTimeout(() => {
							let elem = document.getElementById(searchElemId);
							if (elem)
								elem.focus();
						}, 300)
					} else {
						onClosed();
					}
				} catch (err) {
					// Ignore logging error
				}
			}}
			className={classNames("dropdown-custom", { "disabled": disabled, "in-valid": in_Valid  })}
			tabIndex={0}>
			{/* style={{ pointerEvents: disabled && "none" }} */}
			<Dropdown.Toggle variant="light" size="sm" as="div" id="cd-toggle" className="text-left flx aic" >
				<div className="w97">
					<span className="form-control form-control-sm elps">{getSelectedVal(selectedVal) || title}</span>
				</div>
				<div>
					{ICN_DOWN_SMALL}
				</div>
			</Dropdown.Toggle>
			<Dropdown.Menu className="w100 " show={visible} tabIndex={0}>
				<div className="dropdown-container-box">
					<div className="ddsearch" onClick={(e) => preventEventForSearch(e)}>
						<div className="searchInputType3 w100 flx flx-center">
							<span className="fa-magnif"><i className="fa fa-search"></i></span>
							<div className="flx1 p-rel">
								{icon}
								<input
									type="text"
									id={searchElemId}
									value={search}
									onChange={(e) => {
										onSearch(e.target.value)
										setSearch(e.target.value);
									}}
									placeholder="Search..."
									className="searchInputType3_input" />
							</div>
						</div>
					</div>
					{/* {
						!_.isEmpty(data) && <div className="maxh200">
							{filteredData().map((arr, index) => <Dropdown.Item key={index} disabled={arr["disabled"]} onClick={(e) => { valueSelected(e, arr) }}>{arr[bindKey] || arr}</Dropdown.Item>
							)}
						</div>
					} */}
					{
						!_.isEmpty(data) 
						&& <div className="maxh200">
								{
									multiSelect 
									? <div className="px15">
										<MultiSelectCheckBox {...{
											initialData: filteredData(data),
											selectedValueKey,
											selectedItems,
											setSelectedItems,
											onSelect,
											search,
											bindKey
										}} />
									</div>
									: <>
										{/* Dropdown options without multiSelect & Group by */}
										{
											filteredData().map((arr, index) => <Dropdown.Item 
												key={index} 
												disabled={arr["disabled"]} 
												onClick={(e) => { valueSelected(e, arr) }}
											>{
												// (multipleKeys.map(a => (arr[a] ? arr[a] + ", " : '') ) ?? arr )
											(((`${(arr[bindKey] || '') + ( arr[bindKey] && arr[multiKey] ? ", " + arr[multiKey] : (arr[multiKey] || "")) + (arr[multiKey1] ? ", " + arr[multiKey1] : "") + (arr[multiKey2] ? ", " + arr[multiKey2] : "")}`) ) ?? arr)
											}
											</Dropdown.Item>
										)}
									</>
								}
						</div>
					}
				</div>

				{
					(_.isEmpty(data)
						|| (_.isEmpty(searchKeywords)
							&& filteredData().length === 0 ))
					&& <Dropdown.Item className="pb-3 tcp-none">{noRecordMessage}</Dropdown.Item>
				}

				{
					(_.isEmpty(data)
						|| (_.isEmpty(searchKeywords)
							&& filteredData().length === 0))
					&& onAddList && <div  onClick={()=> onAddList(search)} className="pb-3 px-3 pointer text-center">{IcnAdd({width:"18", height:"18",viewport:"0 0 18 18"})}<span className="pl5">Add this manufacturer's name</span></div>
				}
			</Dropdown.Menu>
		</Dropdown>
	</SelectableContext.Provider>
}
export default CustomDropdown;

// Multi Select checkout with select all option
const MultiSelectCheckBox = ({
	initialData = [],
	bindKey = '',
	selectedValueKey = '',
	selectedItems = [],
	setSelectedItems = () => { },
	onSelect = () => { },
	search = '',
}) => {
	return <>
		{/* Select all check box */}
		{search.length === 0 && <Form.Check
			onChange={(e) => {
				let tmpItems = e.target.checked ? [...initialData] : [];
				onSelect([...tmpItems])
				setSelectedItems([...tmpItems])
			}}
			key='as'
			checked={(() => {
				let fData = initialData;
				let sLength = initialData.filter(c => selectedItems.map(s => s[selectedValueKey]).includes(c[selectedValueKey]))
				return fData.length === sLength.length;
			})()}
			label={<div className="f14 pl5 pt2">All</div>}
			type="checkbox"
			id={getUniqueId()}
		/>}

		{/* Select individual checkbox*/}
		{initialData.map((arr, index) =>
			<Form.Check key={index}
				onChange={(e) => {
					let tmpItems = [...selectedItems];
					if (e.target.checked) {
						tmpItems = [...tmpItems, arr];
					} else {
						let tmpIdx = tmpItems.findIndex(c => c[selectedValueKey] === arr[selectedValueKey]);
						if (tmpIdx >= 0)
							tmpItems.splice(tmpIdx, 1);
					}
					setSelectedItems([...tmpItems])
					onSelect([...tmpItems])
				}}
				checked={selectedItems.map(c => c[selectedValueKey]).some(res => res === arr[selectedValueKey])}
				label={<div className="f14 pl5 pt2">{arr[bindKey] || arr}</div>}
				type="checkbox"
				name={arr[bindKey] || arr}
				id={getUniqueId()}
			/>
		)}
	</>
}