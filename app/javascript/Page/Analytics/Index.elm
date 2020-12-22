module Page.Analytics.Index exposing (..)

import Analytics
import Axis
import Browser
import DateFormat
import Dict
import Html exposing (Html, div, text)
import Http
import Iso8601
import Scale
    exposing
        ( BandConfig
        , BandScale
        , ContinuousScale
        , defaultBandConfig
        )
import Time
import TypedSvg exposing (g, rect, style, svg, text_)
import TypedSvg.Attributes exposing (class, textAnchor, transform, viewBox)
import TypedSvg.Attributes.InPx exposing (height, width, x, y)
import TypedSvg.Core exposing (Svg, text)
import TypedSvg.Types exposing (AnchorAlignment(..), Transform(..))


type alias Model =
    { analytics : Maybe Analytics.Model
    }


type Msg
    = GotAnalytics (Result Http.Error Analytics.Model)


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = \x -> Sub.none
        }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { analytics = Nothing }, Analytics.getAnalytics GotAnalytics )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotAnalytics (Ok analytics) ->
            ( { model | analytics = Just analytics }, Cmd.none )

        GotAnalytics (Err _) ->
            ( model, Cmd.none )


w : Float
w =
    900


h : Float
h =
    250


padding : Float
padding =
    30


dateFormat : Time.Posix -> String
dateFormat =
    DateFormat.format
        [ DateFormat.monthNameAbbreviated
        , DateFormat.text " "
        , DateFormat.yearNumber
        ]
        Time.utc


analyticsToList : Dict.Dict String Int -> List ( Time.Posix, Float )
analyticsToList analytics =
    List.map parseDateAndValue (Dict.toList analytics)


parseDateAndValue : ( String, Int ) -> ( Time.Posix, Float )
parseDateAndValue ( date, value ) =
    case Iso8601.toTime date of
        Result.Ok time ->
            ( time, toFloat value )

        Result.Err _ ->
            ( Time.millisToPosix 0, toFloat value )


xScale : List ( Time.Posix, Float ) -> BandScale Time.Posix
xScale model =
    List.map Tuple.first model
        |> Scale.band
            { defaultBandConfig
                | paddingInner = 0.1
                , paddingOuter = 0.2
            }
            ( 0, w - 2 * padding )


yScale : ContinuousScale Float
yScale =
    Scale.linear ( h - 2 * padding, 0 ) ( 0, 100 )


xAxis : Dict.Dict String Int -> Svg msg
xAxis analytics =
    Axis.bottom []
        (Scale.toRenderable dateFormat (xScale (analyticsToList analytics)))


yAxis : Svg msg
yAxis =
    Axis.left [ Axis.tickCount 5 ] yScale


column : BandScale Time.Posix -> ( Time.Posix, Float ) -> Svg msg
column scale ( date, value ) =
    g [ class [ "column" ] ]
        [ rect
            [ x <| Scale.convert scale date
            , y <| Scale.convert yScale value
            , width <| Scale.bandwidth scale
            , height <| h - Scale.convert yScale value - 2 * padding
            ]
            []
        , text_
            [ x <| Scale.convert (Scale.toRenderable dateFormat scale) date
            , y <| Scale.convert yScale value - 5
            , textAnchor AnchorMiddle
            ]
            [ TypedSvg.Core.text <| String.fromFloat value ]
        ]


viewAnalytics : String -> Dict.Dict String Int -> Html Msg
viewAnalytics title analytics =
    div [class ["bg-white mb-3 p-3 rounded shadow"]]
        [ Html.h2 [class ["text-lg"]] [ Html.text title ]
        , svg [ viewBox 0 0 w h ]
            [ style [] [ TypedSvg.Core.text """
            .column rect { fill: rgba(118, 214, 78, 0.8); }
            .column text { display: none; }
            .column:hover rect { fill: rgb(118, 214, 78); }
            .column:hover text { display: inline; }
          """ ]
            , g [ transform [ Translate (padding - 1) (h - padding) ] ]
                [ xAxis analytics ]
            , g [ transform [ Translate (padding - 1) padding ] ]
                [ yAxis ]
            , g [ transform [ Translate padding padding ], class [ "series" ] ] <|
                List.map (column (xScale (analyticsToList analytics))) (analyticsToList analytics)
            ]
        ]


view : Model -> Html Msg
view model =
    case model.analytics of
        Just analytics ->
            div []
                [ viewAnalytics "Retention rate in the last 6 months" analytics.retention_rate
                , viewAnalytics "Active users in the last 6 months" analytics.active_users
                , viewAnalytics "Guests in the last 6 months" analytics.active_guests
                , viewAnalytics "New users in the last 6 months" analytics.new_users
                , viewAnalytics "Invoice feature usage in the last 6 months" analytics.invoice_feature
                , viewAnalytics "Project invitation feature usage in the last 6 months" analytics.project_invitation_feature
                , viewAnalytics "Projects created in the last 6 months" analytics.projects_created
                , viewAnalytics "Invoices created in the last 6 months" analytics.invoices_created
                , viewAnalytics "Project invitations in the last 6 months" analytics.project_invitations
                ]

        Nothing ->
            div [] [ Html.text "Loading..." ]
