<html>
  <body>
    <p>Hi {{$user->name}}, terima kasih kerana menggunakan carpool.pulangmengundi.com!</p>
    <p>
      Anda menerima e-mel ini kerana kami mendapati penjodohan carpool untuk anda yang anda akan mencari di bawah
    </p>
    <p>
      <strong>PENTING:</strong> Jika anda telah berjaya disambungkan melalui platform kami, sila pergi ke
      <a href="https://carpool.pulangmengundi.com/offer">laman pemandu</a> atau <a href="https://carpool.pulangmengundi.com/need">laman penunggang</a> anda.
    </p>
    <p>
      Anda kemudiannya boleh memilih untuk menutup senaraian carpool anda, tetapi <strong>sila nyatakan</strong> jika anda berjaya mencari penjodohan yang sesuai melalui pihak kami.
      Ini adalah <strong>bantuan besar</strong> dalam meningkatkan kualiti platform kami.
    </p>
    <p>
      Keselamatan anda diutamakan dalam proses ini. Sila ambil perhatian terhadap <a href="https://www.pulangmengundi.com/guidelines.html#carpoolguide">garis panduan keselamatan</a> dan kekal selamat.
      Selamat berkongsi kereta! #CarpoolGE14
    </p>
    <p>Untuk sebarang pertanyaan, carikan kami di <a href="https://facebook.com/pulangmengundi">Facebook</a>, atau e-mel di pulang.undi@gmail.com.</p>
    <hr />
    <p>Hi {{$user->name}}, thank you for using carpool.pulangmengundi.com!</p>
    <p>
      You are receiving this email because we have found matches for you which you will find below.
    </p>
    <p>
      <strong>IMPORTANT:</strong> If you have already been connected successfully through our platform, please go to
      <a href="https://carpool.pulangmengundi.com/offer">your driver page</a> or <a href="https://carpool.pulangmengundi.com/need">your rider page</a>.
    </p>
    <p>
      You can then choose to close your listing, but <strong>please</strong> specify if you managed to find a match through us.
      This helps us <strong>greatly</strong> in improving our platform.
    </p>
    <p>
      As always, your safety is of paramount importance to us. Take note of the <a href="https://www.pulangmengundi.com/guidelines.html#carpoolguide">guidelines we have outlined</a> and stay safe.
      Happy carpooling! #CarpoolGE14
    </p>
    <p>For any questions, look for us on <a href="https://facebook.com/pulangmengundi">Facebook</a>, or email us at pulang.undi@gmail.com.</p>
    <hr />
    @if ($matchedNeeds->count() > 0)
    <h1>We&apos;ve found some riders that may be going the same way:<h1>
    @foreach ($matchedNeeds as $need)
      <h3>{{$need->user->name}}</h3>
      <strong>Gender:</strong>
      <p>{{$need->gender}}</p>
      <strong>Travelling from:</strong>
      <p>{{$need->fromLocation->name}} ({{$need->fromLocation->locationState->name}})</p>
      <strong>Travelling to:</strong>
      <p>{{$need->pollLocation->name}} ({{$need->pollLocation->locationState->name}})</p>
      @if (!empty($need->information))
      <strong>Information</strong>
      <p>{{$need->information}}</p>
      @endif
      <strong>Contact information:</strong><br />
      @if ($need->user->allow_fb)
      <p>
        <a target='_blank' href='https://facebook.com/{{$need->user->fb_id}}'>Facebook Profile link</a>
      </p>
      @endif
      @if ($need->user->allow_email)
      <p>
        <strong>Email address:</strong> {{$need->user->email}}
      </p>
      @endif
      @if ($need->user->contact_number)
      <p>
        <strong>Contact number:</strong> {{$need->user->contact_number}}
      </p>
      @endif
    @endforeach
    @endif

    @if ($matchedOffers->count() > 0)
    <h1>We&apos;ve found some drivers that may be going the same way:<h1>
    @foreach ($matchedOffers as $offer)
      <h3>{{$offer->user->name}}</h3>
      @if ($offer->gender_preference)
      <strong>Gender preference:</strong>
      <p>{{$offer->gender_preference}}</p>
      @endif
      <strong>Travelling from:</strong>
      <p>{{$offer->fromLocation->name}} ({{$offer->fromLocation->locationState->name}})</p>
      <strong>Travelling to:</strong>
      <p>{{$offer->toLocation->name}} ({{$offer->toLocation->locationState->name}})</p>
      @if(!empty($offer->information))
      <strong>Information</strong>
      <p>{{$offer->information}}</p>
      @endif
      <strong>Contact information:</strong><br />
      @if ($offer->user->allow_fb)
      <p>
        <a target='_blank' href='https://facebook.com/{{$offer->user->fb_id}}'>Facebook Profile link</a>
      </p>
      @endif
      @if ($offer->user->allow_email)
      <p>
        <strong>Email address:</strong> {{$offer->user->email}}
      </p>
      @endif
      @if ($offer->user->contact_number)
      <p>
        <strong>Contact number:</strong> {{$offer->user->contact_number}}
      </p>
      @endif
    @endforeach
    @endif

    @if ($user->need)
      <h1>Your rider request information</h1>
      <strong>Gender:</strong>
      <p>{{$user->need->gender}}</p>
      <strong>Travelling from:</strong>
      <p>{{$user->need->fromLocation->name}} ({{$user->need->fromLocation->locationState->name}})</p>
      <strong>Travelling to:</strong>
      <p>{{$user->need->pollLocation->name}} ({{$user->need->pollLocation->locationState->name}})</p>
      @if (!empty($user->need->information))
      <strong>Information</strong>
      <p>{{$user->need->information}}</p>
      @endif
      <strong>Contact information:</strong><br />
      @if ($user->allow_fb)
      <p>
        <a target='_blank' href='https://facebook.com/{{$user->fb_id}}'>Facebook Profile link</a>
      </p>
      @endif
      @if ($user->allow_email)
      <p>
        <strong>Email address:</strong> {{$user->email}}
      </p>
      @endif
      @if ($user->contact_number)
      <p>
        <strong>Contact number:</strong> {{$user->contact_number}}
      </p>
      @endif
    @endif

    @if($user->offers->count())
    <h3>Your carpool driver offers</h3>
    @foreach($user->offers as $offer)
      @if ($offer->gender_preference)
      <strong>Gender preference:</strong>
      <p>{{$offer->gender_preference}}</p>
      @endif
      <strong>Travelling from:</strong>
      <p>{{$offer->fromLocation->name}} ({{$offer->fromLocation->locationState->name}})</p>
      <strong>Travelling to:</strong>
      <p>{{$offer->toLocation->name}} ({{$offer->toLocation->locationState->name}})</p>
      @if(!empty($offer->information))
      <strong>Information</strong>
      <p>{{$offer->information}}</p>
      @endif
      <strong>Contact information:</strong><br />
      @if ($user->allow_fb)
      <p>
        <a target='_blank' href='https://facebook.com/{{$user->fb_id}}'>Facebook Profile link</a>
      </p>
      @endif
      @if ($user->allow_email)
      <p>
        <strong>Email address:</strong> {{$user->email}}
      </p>
      @endif
      @if ($user->contact_number)
      <p>
        <strong>Contact number:</strong> {{$user->contact_number}}
      </p>
      @endif
    @endforeach
    @endif
  </body>
</html>