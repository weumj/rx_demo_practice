const $loading = document.getElementById("loading");

const showLoading = () => {
  $loading.style.display = "block";
};
const hideLoading = () => {
  $loading.style.display = "none";
};

const {
  Subject,
  fromEvent,
  ajax: { ajax },
  operators: {
    map,
    debounceTime,
    partition,
    tap,
    distinctUntilChanged,
    switchMap,
    retry,
    finalize,
    share,
  },
} = rxjs;

const keyup$ = fromEvent(document.getElementById("search"), "keyup").pipe(
  debounceTime(300), // 300ms 뒤에 데이터를 전달한다.
  map(event => event.target.value),
  distinctUntilChanged(), // 특수키가 입력된 경우에는 나오지 않기 위해 중복 데이터 처리
  tap(v => console.log("from keyup$", v)),
  share(),
);

let [user$, reset$] = keyup$.pipe(partition(query => query.trim().length > 0));

user$ = user$.pipe(
  tap(showLoading),
  switchMap(query =>
    ajax.getJSON(`https://api.github.com/search/users?q=${query}`),
  ),
  tap(hideLoading),
  retry(2),
  finalize(hideLoading),
);

reset$.pipe(tap(() => ($layer.innerHTML = ""))).subscribe();

const $layer = document.getElementById("suggestLayer");

const drawLayer = items => {
  $layer.innerHTML = items
    .map(
      user =>
        `
    <li class="user">
        <img src="${user.avatar_url}" width="50px" height="50px"/>
        <p><a href="${user.html_url}" target="_blank">${user.login}</a></p>
    </li>
`,
    )
    .join("");
};

user$.subscribe({
  next: v => {
    drawLayer(v.items);
  },
  error: e => {
    console.error(e);
    alert(e.message);
  },
});
keyup$.connect();
