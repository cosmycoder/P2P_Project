const Board = ({size, table}) => {
	const rows = [];
	for (let i = 0; i < size; i++) {
		rows.push(<Row key={i.toString()} className="flex" size={size} rowNums={table[i]}/>)
	}
	return (
		<>

		<div className="flex flex-col gap-1 mb-5 mt-24">
			{rows}
		</div>

		{/* <form className="flex flex-col justify-evenly items-center max-w-full w-full" onSubmit={onSubmit}>
			<div>
				<input placeholder='Indovina la parola' type="text" className='font-mono text-md w-96 p-2 bg-gray-200 text-primary rounded-md outline-none transition duration-150 ease-in-out shadow-2xl' name="word" value={word} onChange={e => onChange(e)} />
			</div>
			<div>
				<input type="submit" className="btn-standard mt-4 items-center rounded-2xl bg-sky-200 hover:bg-sky-400 dark:text-white dark:bg-sky-800 p-3 pr-5 pl-5 hover:dark:bg-sky-900 hover:text-white" value="Invia" />
			</div>
			</form> */}
		</>
	);

}

const Row = ({size, rowNums}) => {
	const items = [];
	for (let i = 0; i < size; i++) {
        items.push(<Tile key={i.toString()} className="flex" number={rowNums[i]}/>)
    }
	return (
	<div className="flex flex-row gap-1">
		 {items}
	</div>);

}

const Tile = ({number}) => {
	// const getBgColor = (s) => {
	// 	switch(s) {
	// 		case '':
	// 			return "not-in-word";
	// 		case '?':
	// 			return "not-in-place";
	// 		case '+':
	// 			return "correct";
	// 		default:
	// 			return "not-in-word"
	// 	}
	// }
	return (
		<div className={"h-12 w-12 border flex m-0 dark:text-white text-black dark:border-gray-50 border-gray-700 rounded-md"}><div className="m-auto">{number}</div></div>
	);
}

export default Board;
